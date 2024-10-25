import { describe, test, before, after } from 'node:test'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import assert from 'node:assert'
import { pipeline } from 'node:stream/promises'
import { fetch } from 'undici'
import { normalize, config } from '../../src/main-node'
import { assertMatchCloseTo } from '../helpers'

async function downloadFile(file: string, destDir: string) {
  const resp = await fetch(`https://japanese-addresses-v2.geoloniamaps.com/api/${file}`)
  const outputFile = path.join(destDir, file)
  await fs.promises.mkdir(path.dirname(outputFile), { recursive: true })
  const writer = fs.createWriteStream(outputFile)
  if (!resp.body) { throw new Error('No body') }
  await pipeline(resp.body, writer)
}

describe(`API stored in filesystem`, () => {
  let tmpdir: string
  before(async () => {
    tmpdir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'qtile-update-csv-'))
    const files = [
      'ja.json',
      'ja/東京都/渋谷区.json',
      'ja/東京都/渋谷区-住居表示.txt',
    ]
    for (const file of files) {
      await downloadFile(file, tmpdir)
    }

    config.japaneseAddressesApi = `file://${tmpdir}/ja`
  })

  after(async () => {
    await fs.promises.rm(tmpdir, { recursive: true, force: true })
  })

  test(`基本的に動く`, async () => {
    const res = await normalize('渋谷区道玄坂1-10-8')
    assertMatchCloseTo(res, {
      pref: '東京都',
      city: '渋谷区',
      town: '道玄坂一丁目',
      level: 8,
    })
  })

  test(`用意されていないエリアはエラーになる`, async () => {
    try {
      await normalize('東京都千代田区')
    } catch (e) {
      assert.strictEqual(e.code, 'ENOENT')
    }
  })
})
