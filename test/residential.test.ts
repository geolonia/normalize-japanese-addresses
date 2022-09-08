import * as Normalize from '../src/normalize'
import { normalize } from '../src/main-node'
import unfetch from 'isomorphic-unfetch'

beforeAll(() => {
  Normalize.__internals.fetch = (input: string) => {
    let url = new URL(
      `${Normalize.config.japaneseAddressesApi}${input}`,
    ).toString()
    if (Normalize.config.geoloniaApiKey) {
      url += `?geolonia-api-key=${Normalize.config.geoloniaApiKey}`
    }
    return unfetch(url, { headers: { Origin: 'https://geolonia.com' } })
  }
  jest.setTimeout(5000)
})

test('住居表示', async () => {
  const normResult = await normalize(
    '東京都世田谷区北烏山６−２２−２２ おはようビル',
    {
      geoloniaApiKey: 'YOUR-API-KEY',
    },
  )
  expect(normResult.level).toEqual(8)
  expect(normResult.gaiku).toEqual('22')
  expect(normResult.jyukyo).toEqual('22')
  expect(normResult.addr).toEqual('おはようビル')
})

test('住居表示だが、知らない号', async () => {
  const normResult = await normalize(
    '東京都世田谷区北烏山６−２２番１２３４５６７８９０号 おはようビル',
    {
      geoloniaApiKey: 'YOUR-API-KEY',
    },
  )
  expect(normResult.level).toEqual(7)
  expect(normResult.gaiku).toEqual('22')
  expect(normResult.addr).toEqual('-1234567890 おはようビル')
})

test('住居表示未整備', async () => {
  const normResult = await normalize('滋賀県米原市甲津原999', {
    geoloniaApiKey: 'YOUR-API-KEY',
  })
  expect(normResult.level).toEqual(3)
  expect(normResult.addr).toEqual('999')
  expect(normResult.gaiku).toBeUndefined()
  expect(normResult.jyukyo).toBeUndefined()
})
