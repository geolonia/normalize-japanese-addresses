import { normalize, config } from '../src/main-node'

jest.setTimeout(3 * 60 * 1000)

beforeAll(async () => {
  config.japaneseAddressesApi = `https://japanese-addresses.geolonia.com/next/ja`
  jest.setTimeout(5000)
})

test('住居表示1', async () => {
  const normResult = await normalize(
    '東京都世田谷区北烏山６−２２−２２ おはようビル',
    {
      level: 8,
    },
  )
  expect(normResult.level).toEqual(8)
  expect(normResult.gaiku).toEqual('22')
  expect(normResult.jyukyo).toEqual('22')
  expect(normResult.addr).toEqual('おはようビル')
})

test('住居表示2', async () => {
  const normResult = await normalize(
    '東京都世田谷区北烏山６−２２番２２号 おはようビル',
    {
      level: 8,
    },
  )
  expect(normResult.level).toEqual(8)
  expect(normResult.gaiku).toEqual('22')
  expect(normResult.jyukyo).toEqual('22')
  expect(normResult.addr).toEqual('おはようビル')
})
