import { describe, test } from 'node:test'
import assert from 'node:assert'
import { normalize } from '../../src/main-node'

describe(`metadata tests`, () => {
  test(`all fields are present`, async () => {
    const res = await normalize('渋谷区道玄坂1-10-8')
    assert.strictEqual(res.metadata.input, '渋谷区道玄坂1-10-8')

    assert.strictEqual(res.metadata.prefecture?.code, 130001)
    assert.strictEqual(res.metadata.prefecture?.pref, '東京都')
    assert.strictEqual(res.metadata.prefecture?.pref_k, 'トウキョウト')
    assert.strictEqual(res.metadata.prefecture?.pref_r, 'Tokyo')
    assert.ok(!('cities' in res.metadata.prefecture))

    assert.strictEqual(res.metadata.city?.code, 131130)
    assert.strictEqual(res.metadata.city?.city, '渋谷区')
    assert.strictEqual(res.metadata.city?.city_k, 'シブヤク')
    assert.strictEqual(res.metadata.city?.city_r, 'Shibuya-ku')

    assert.strictEqual(res.metadata.machiAza?.oaza_cho, '道玄坂')
    assert.strictEqual(res.metadata.machiAza?.oaza_cho_k, 'ドウゲンザカ')
    assert.strictEqual(res.metadata.machiAza?.oaza_cho_r, 'Dogenzaka')
    assert.strictEqual(res.metadata.machiAza?.chome_n, 1)

    assert.strictEqual(res.metadata.rsdt?.blk_num, '10')
    assert.strictEqual(res.metadata.rsdt?.rsdt_num, '8')

    assert.strictEqual(res.metadata.chiban, undefined)
  })

  test(`the appropriate fields are not set if level is set`, async () => {
    const res = await normalize('渋谷区道玄坂1-10-8', { level: 2 })
    assert.strictEqual(res.metadata.input, '渋谷区道玄坂1-10-8')

    assert.ok(res.metadata.prefecture)
    assert.ok(res.metadata.city)

    assert.strictEqual(res.metadata.machiAza, undefined)
    assert.strictEqual(res.metadata.rsdt, undefined)
    assert.strictEqual(res.metadata.chiban, undefined)
  })
})
