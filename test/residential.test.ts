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

test('住居表示1', async () => {
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

test('住居表示2', async () => {
  const normResult = await normalize(
    '東京都世田谷区北烏山６−２２番２２号 おはようビル',
    {
      geoloniaApiKey: 'YOUR-API-KEY',
    },
  )
  expect(normResult.level).toEqual(8)
  expect(normResult.gaiku).toEqual('22')
  expect(normResult.jyukyo).toEqual('22')
  expect(normResult.addr).toEqual('おはようビル')
})
