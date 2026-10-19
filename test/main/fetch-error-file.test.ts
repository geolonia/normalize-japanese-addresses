import { describe, test, before, after, mock } from 'node:test'
import assert from 'node:assert'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { fetch } from 'undici'
import { normalize, config } from '../../src/main-node'

// file:// の読み取り失敗は決定的なのでリトライされないことの確認 (#279)
// fs.promises.open をフックして対象ファイルが開かれた回数を数える

const realOpen = fs.promises.open
let openCounts: Record<string, number> = {}
let shortReadTarget: string | undefined
let failOpenTarget: string | undefined

function installOpenCounter() {
  openCounts = {}
  shortReadTarget = undefined
  failOpenTarget = undefined
  mock.method(
    fs.promises,
    'open',
    async (filePath: string, ...rest: unknown[]) => {
      const p = String(filePath)
      openCounts[p] = (openCounts[p] ?? 0) + 1
      if (failOpenTarget && p.endsWith(failOpenTarget)) {
        // ディレクトリを読もうとした場合などの I/O エラーを模す
        throw Object.assign(
          new Error('EISDIR: illegal operation on a directory, read'),
          { code: 'EISDIR' },
        )
      }
      const handle = await (
        realOpen as (...a: unknown[]) => Promise<fs.promises.FileHandle>
      ).call(fs.promises, filePath, ...rest)
      if (shortReadTarget && p.endsWith(shortReadTarget)) {
        // Range 読みが常に短い読み取りになる FileHandle を模す
        return {
          read: async () => ({ bytesRead: 0, buffer: Buffer.alloc(0) }),
          readFile: handle.readFile.bind(handle),
          close: handle.close.bind(handle),
        } as unknown as fs.promises.FileHandle
      }
      return handle
    },
  )
}

async function downloadFile(file: string, destDir: string) {
  const resp = await fetch(
    `https://japanese-addresses-v2.geoloniamaps.com/api/${file}`,
  )
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

describe(`file:// の決定的な失敗はリトライされない`, () => {
  let tmpdir: string

  before(async () => {
    tmpdir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), 'nja-fetch-error-file-'),
    )
    installOpenCounter()
  })

  after(async () => {
    mock.restoreAll()
    await fs.promises.rm(tmpdir, { recursive: true, force: true })
  })

  test(`壊れた JSON は 1 回の読み取りでエラーになる`, async () => {
    const dir = path.join(tmpdir, 'broken-json')
    await fs.promises.mkdir(dir, { recursive: true })
    await fs.promises.writeFile(path.join(dir, 'ja.json'), '<html>error</html>')
    config.japaneseAddressesApi = `file://${dir}/ja`

    await assert.rejects(
      () => normalize('東京都渋谷区'),
      /住所データの取得に失敗しました/,
    )
    // Windows ではパスの区切り文字が異なるため、正規化してから比較する
    const expected = path.join(dir, 'ja.json').replace(/\\/g, '/')
    const key = Object.keys(openCounts).find(
      (p) => p.replace(/\\/g, '/') === expected,
    )
    const opened = key ? openCounts[key] : 0
    assert.strictEqual(
      opened,
      1,
      `ja.json は 1 回だけ開かれるべき (実際: ${opened} 回)`,
    )
  })

  test(`Range の短い読み取りは 1 回でエラーになる`, async () => {
    const dir = path.join(tmpdir, 'short-read')
    for (const file of [
      'ja.json',
      'ja/東京都/渋谷区.json',
      'ja/東京都/渋谷区-住居表示.txt',
    ]) {
      await downloadFile(file, dir)
    }
    config.japaneseAddressesApi = `file://${dir}/ja`
    shortReadTarget = '-住居表示.txt'

    await assert.rejects(
      () => normalize('渋谷区道玄坂1-10-8'),
      /住所データの取得に失敗しました/,
    )
    const key = Object.keys(openCounts).find((p) => p.endsWith('-住居表示.txt'))
    const opened = key ? openCounts[key] : 0
    assert.strictEqual(
      opened,
      1,
      `住居表示.txt は 1 回だけ開かれるべき (実際: ${opened} 回)`,
    )
  })

  test(`open の I/O エラー (EISDIR など) は 1 回でエラーになる`, async () => {
    const dir = path.join(tmpdir, 'eisdir')
    // 町字データだけが I/O エラーになる状況を作る
    await downloadFile('ja.json', dir)
    config.japaneseAddressesApi = `file://${dir}/ja`
    failOpenTarget = '京都市左京区.json'

    await assert.rejects(
      () => normalize('京都府京都市左京区吉田本町'),
      /住所データの取得に失敗しました/,
    )
    const key = Object.keys(openCounts).find((p) =>
      p.endsWith('京都市左京区.json'),
    )
    const opened = key ? openCounts[key] : 0
    assert.strictEqual(
      opened,
      1,
      `京都市左京区.json は 1 回だけ開かれるべき (実際: ${opened} 回)`,
    )
  })
})
