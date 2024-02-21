import { normalize, config } from '../../src/main-node'
import { NormalizeResult } from '../../src/normalize'

config.interfaceVersion = 2
config.transformRequest = async (url, query) => {
  console.log(url, query)
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
          { addr: '3-1', lat: '30.25', lng: '135.25' },
          { addr: '3-19', lat: '30.3', lng: '135.3' },
          { addr: '13-1', lat: '30.4', lng: '135.4' },
          { addr: '13-14', lat: '30.45', lng: '135.45' },
          { addr: '13-19', lat: '30.5', lng: '135.5' },
        ]
      } else {
        return []
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

const expectedCommon = { pref: 'A県', city: 'X市', town: 'あああ', level: 8 }
const cases: { input: string; expected: NormalizeResult }[] = [
  {
    input: 'A県 X市 あああ1-1 こんばんはビル',
    expected: {
      ...expectedCommon,
      addr: '1-1',
      other: 'こんばんはビル',
      lng: 135.1,
      lat: 30.1,
    },
  },
  {
    input: 'A県 X市 あああ3-1 こんばんはビル',
    expected: {
      ...expectedCommon,
      addr: '3-1',
      other: 'こんばんはビル',
      lng: 135.25,
      lat: 30.25,
    },
  },
  {
    input: 'A県 X市 あああ3-19 こんばんはビル',
    expected: {
      ...expectedCommon,
      addr: '3-19',
      other: 'こんばんはビル',
      lng: 135.3,
      lat: 30.3,
    },
  },
  {
    input: 'A県 X市 あああ13-1 こんばんはビル',
    expected: {
      ...expectedCommon,
      addr: '13-1',
      other: 'こんばんはビル',
      lng: 135.4,
      lat: 30.4,
    },
  },
  {
    input: 'A県 X市 あああ13-14 こんばんはビル',
    expected: {
      ...expectedCommon,
      addr: '13-14',
      other: 'こんばんはビル',
      lng: 135.45,
      lat: 30.45,
    },
  },
  {
    input: 'A県 X市 あああ13-19 こんばんはビル',
    expected: {
      ...expectedCommon,
      addr: '13-19',
      other: 'こんばんはビル',
      lng: 135.5,
      lat: 30.5,
    },
  },
]

for (const { input, expected } of cases) {
  test(`リクエスト変形テスト - ${input}`, async () => {
    const res = await normalize(input, { level: 8 })
    expect(res).toStrictEqual(expected)
  })
}

test('リクエスト変形テスト - 全く正規化できないケース', async () => {
  const res = await normalize('こんにちはこんにちは', { level: 8 })
  expect(res).toStrictEqual({
    pref: '',
    city: '',
    town: '',
    addr: 'こんにちはこんにちは',
    lat: null,
    lng: null,
    level: 0,
  })
})
