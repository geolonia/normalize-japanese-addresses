import { normalize, config } from '../../src/main-node'

config.interfaceVersion = 2
config.transformRequest = async (url, query) => {
  const { level, pref = '', city = '', town = '' } = query

  switch (level) {
    case 1: {
      const actual = url.toString()
      const expected = config.japaneseAddressesApi + '.json'
      if (actual !== expected) {
        throw new Error(`Invalid URL: ${actual} should be ${expected}`)
      }
      return {
        A県: ['X市', 'Y市', 'Z町'],
      }
    }
    case 3: {
      const actual = url.toString()
      const expected =
        config.japaneseAddressesApi +
        `/${encodeURIComponent(pref)}/${encodeURIComponent(city)}.json`
      if (actual !== expected) {
        throw new Error(`Invalid URL: ${actual} should be ${expected}`)
      }
      if (pref === 'A県' && city === 'X市') {
        return [
          { town: 'あああ', koaza: '', lat: '30', lng: '135' },
          { town: 'いいい', koaza: '', lat: '31', lng: '135' },
        ]
      } else {
        return null
      }
    }
    case 8: {
      const actual = url.toString()
      const expected =
        config.japaneseAddressesApi +
        `/${encodeURIComponent(pref)}/${encodeURIComponent(
          city,
        )}/${encodeURIComponent(town)}.json`
      if (actual !== expected) {
        throw new Error(`Invalid URL: ${actual} should be ${expected}`)
      }
      if (pref === 'A県' && city === 'X市' && town === 'あああ') {
        return [
          { addr: '1-1', lat: '30.1', lng: '135.1' },
          { addr: '1-2', lat: '30.2', lng: '135.2' },
          { addr: '2-3', lat: null, lng: null },
        ]
      }
    }
    default:
      throw new Error(`Invalid required normalization level: ${level}`)
  }
}

// interfaceVersion 2 に対するテスト。
// addr として住居表示または地番を返す。
// addr 以降の列は other として返す。
// transformRequest が使用可能。
// 将来的にこちらをデフォルトにする予定。

test('リクエスト変形テスト 1', async () => {
  const res = await normalize('A県 X市 あああ 1の2おはようビル', { level: 3 })
  expect(res).toStrictEqual({
    pref: 'A県',
    city: 'X市',
    town: 'あああ',
    addr: '1-2おはようビル',
    lng: 135,
    level: 3,
    lat: 30,
  })
})

test('リクエスト変形テスト 2', async () => {
  const res = await normalize('A県 X市 あああ 1の2おはようビル', { level: 8 })
  expect(res).toStrictEqual({
    pref: 'A県',
    city: 'X市',
    town: 'あああ',
    addr: '1-2',
    other: 'おはようビル',
    lng: 135.2,
    level: 8,
    lat: 30.2,
  })
})

test('リクエスト変形テスト - レベル8 で緯度経度が null の時はレベル3の緯度経度を使う', async () => {
  const res = await normalize('A県 X市 あああ 2の3 こんばんはビル', {
    level: 8,
  })
  expect(res).toStrictEqual({
    pref: 'A県',
    city: 'X市',
    town: 'あああ',
    addr: '2-3',
    other: 'こんばんはビル',
    lng: 135,
    level: 8,
    lat: 30,
  })
})
