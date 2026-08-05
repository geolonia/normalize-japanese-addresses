import { describe, test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert'
import http from 'node:http'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import { AddressInfo } from 'node:net'
import { pipeline } from 'node:stream/promises'
import { fetch } from 'undici'
import { normalize, config } from '../../src/main-node'

async function downloadFile(file: string, destDir: string) {
  const resp = await fetch(
    `https://japanese-addresses-v2.geoloniamaps.com/api/${file}`,
  )
  // 失敗した応答の本文を保存してしまうと、後でローカルサーバーがそれを 200 で
  // 返し、セットアップの失敗が分かりにくいテストの失敗に化ける
  if (!resp.ok) {
    throw new Error(`Failed to download ${file}: HTTP ${resp.status}`)
  }
  if (!resp.body) {
    throw new Error(`No body: ${file}`)
  }
  const outputFile = path.join(destDir, file)
  await fs.promises.mkdir(path.dirname(outputFile), { recursive: true })
  const writer = fs.createWriteStream(outputFile)
  await pipeline(resp.body, writer)
}

/** 住居表示のサブリソースに対して、あと何回どのステータスを返すか */
const subresourceFailure = { remaining: 0, status: 503 }
/** 住居表示のサブリソースへのリクエスト回数 */
let subresourceRequests = 0

describe(`データ取得に失敗したときの挙動`, () => {
  let tmpdir: string
  let server: http.Server

  before(async () => {
    tmpdir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), 'nja-fetch-error-'),
    )
    for (const file of [
      'ja.json',
      'ja/東京都/渋谷区.json',
      'ja/東京都/渋谷区-住居表示.txt',
    ]) {
      await downloadFile(file, tmpdir)
    }

    server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0])

      if (urlPath.endsWith('-住居表示.txt')) {
        subresourceRequests += 1
        if (subresourceFailure.remaining > 0) {
          subresourceFailure.remaining -= 1
          res.writeHead(subresourceFailure.status, {
            'content-type': 'text/plain; charset=utf-8',
          })
          // エラーページの本文を返す CDN を模す。status に 200 を指定すると
          // 「ok だが本文がエラーページ」というケースになる
          res.end('<html><body>error</body></html>')
          return
        }
      }

      let body: Buffer
      try {
        body = fs.readFileSync(path.join(tmpdir, urlPath))
      } catch {
        res.writeHead(404)
        res.end('not found')
        return
      }

      const range = /^bytes=(\d+)-(\d+)$/.exec(req.headers.range ?? '')
      if (range) {
        const start = Number(range[1])
        const end = Number(range[2])
        const slice = body.subarray(start, end + 1)
        res.writeHead(206, {
          'content-length': String(slice.length),
          'content-range': `bytes ${start}-${end}/${body.length}`,
        })
        res.end(slice)
        return
      }

      res.writeHead(200, { 'content-length': String(body.length) })
      res.end(body)
    })

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const { port } = server.address() as AddressInfo
    config.japaneseAddressesApi = `http://127.0.0.1:${port}/ja`
  })

  after(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    )
    await fs.promises.rm(tmpdir, { recursive: true, force: true })
  })

  beforeEach(() => {
    subresourceFailure.remaining = 0
    subresourceFailure.status = 503
    subresourceRequests = 0
  })

  // 町字ごとにキャッシュされるため、テストごとに異なる町字を使う

  test(`一過性の 5xx はリトライして回復する`, async () => {
    subresourceFailure.remaining = 1
    subresourceFailure.status = 503

    const res = await normalize('渋谷区道玄坂1-10-8')

    assert.strictEqual(res.level, 8)
    assert.strictEqual(res.addr, '10-8')
    assert.strictEqual(subresourceRequests, 2)
  })

  test(`5xx が続く場合は縮退せずにエラーになる`, async () => {
    subresourceFailure.remaining = Number.MAX_SAFE_INTEGER
    subresourceFailure.status = 503

    await assert.rejects(
      () => normalize('渋谷区神南1-1-1'),
      (e: Error) => {
        assert.match(e.message, /住居表示/)
        assert.match(e.message, /503/)
        return true
      },
    )
    // 初回の要求を含めて 3 回で打ち切る
    assert.strictEqual(subresourceRequests, 3)
  })

  test(`Cloudflare の 52x もリトライの対象になる`, async () => {
    // 配信元の Cloudflare は origin 側の不調に対して 520 から 527 を返す
    subresourceFailure.remaining = 2
    subresourceFailure.status = 520

    const res = await normalize('渋谷区恵比寿4-20-3')

    assert.strictEqual(res.level, 8)
    assert.strictEqual(res.addr, '20-3')
    assert.strictEqual(subresourceRequests, 3)
  })

  test(`200 でエラーページが返った場合もリトライして回復する`, async () => {
    // Range で要求した長さと本文のバイト長が食い違うことで検知する
    subresourceFailure.remaining = 1
    subresourceFailure.status = 200

    const res = await normalize('渋谷区宇田川町15-1')

    assert.strictEqual(res.level, 8)
    assert.strictEqual(res.addr, '15-1')
    assert.strictEqual(subresourceRequests, 2)
  })

  test(`200 のエラーページが続く場合は縮退せずにエラーになる`, async () => {
    subresourceFailure.remaining = Number.MAX_SAFE_INTEGER
    subresourceFailure.status = 200

    await assert.rejects(
      () => normalize('渋谷区神宮前6-19-13'),
      (e: Error) => {
        assert.match(e.message, /住居表示/)
        assert.match(e.message, /バイト/)
        return true
      },
    )
    assert.strictEqual(subresourceRequests, 3)
  })

  test(`404 はリトライせずにエラーになる`, async () => {
    subresourceFailure.remaining = Number.MAX_SAFE_INTEGER
    subresourceFailure.status = 404

    await assert.rejects(() => normalize('渋谷区桜丘町13-3'))
    assert.strictEqual(subresourceRequests, 1)
  })
})
