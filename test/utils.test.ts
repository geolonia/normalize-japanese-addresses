import { normalize, config } from '../src/main-node'

config.transformRequest = async (url, query) => {
  const { level, pref, city, town } = query
  switch (level) {
    case 1:
      return {
        A県: ['X市', 'Y市', 'Z町'],
      }
    case 3:
      if (pref === 'A県' && city === 'X市') {
        return [
          { town: 'あああ', koaza: '', lat: '30', lng: '135' },
          { town: 'いいい', koaza: '', lat: '31', lng: '135' },
        ]
      } else {
        return null
      }
    case 8:
      if (pref === 'A県' && city === 'X市' && town === 'あああ') {
        return [
          { addr: '1-1', lat: '30.1', lng: '135.1' },
          { addr: '1-2', lat: '30.2', lng: '135.2' },
        ]
      }
    default:
      return null
  }
}

test('リクエスト変形テスト', async () => {
  const res = await normalize('A県 X市 あああ123-45', { level: 3 })
  expect(res).toStrictEqual({
    pref: 'A県',
    city: 'X市',
    town: 'あああ',
    addr: '123-45',
    lng: 135,
    level: 3,
    lat: 30,
  })
})
