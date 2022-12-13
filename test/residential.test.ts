import * as Normalize from '../src/normalize'
import { normalize } from '../src/main-node'
import unfetch from 'isomorphic-unfetch'
import { gh_pages_endpoint } from '../src/config'

test('default endppoint', () => {
  expect(Normalize.config.japaneseAddressesApi).toEqual(gh_pages_endpoint)
})

describe('Request with Geolonia backend', () => {
  const default_fetch = Normalize.__internals.fetch
  beforeEach(() => {
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
  afterEach(() => {
    Normalize.__internals.fetch = default_fetch
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
})

describe('tests for config', () => {
  test('endpoint customization', async () => {
    const default_url = Normalize.config.japaneseAddressesApi
    Normalize.config.japaneseAddressesApi = 'hello'
    try {
      await normalize('東京都世田谷区北烏山６−２２−２２ おはようビル')
    } catch {
    } finally {
      expect(Normalize.config.japaneseAddressesApi).toEqual('hello')
      // clean up
      Normalize.config.japaneseAddressesApi = default_url
    }
  })

  test('with Geolonia API Key', async () => {
    const default_config = { ...Normalize.config }
    try {
      await normalize('東京都世田谷区北烏山６−２２−２２ おはようビル', {
        geoloniaApiKey: 'another-api-key',
      })
    } catch {
    } finally {
      expect(Normalize.config.japaneseAddressesApi).toEqual(
        'https://japanese-addresses.geolonia.com/next/ja',
      )
      // @ts-ignore - clean up
      Normalize.config = default_config
    }
  })

  test('endpoint customization with Geolonia API Key', async () => {
    const default_url = Normalize.config.japaneseAddressesApi
    Normalize.config.japaneseAddressesApi = 'hello'
    try {
      await normalize('東京都世田谷区北烏山６−２２−２２ おはようビル', {
        geoloniaApiKey: 'another-api-key',
      })
    } catch {
    } finally {
      expect(Normalize.config.japaneseAddressesApi).toEqual('hello')
      // clean up
      Normalize.config.japaneseAddressesApi = default_url
    }
  })

  test('also works with dev backend', async () => {
    const default_url = Normalize.config.japaneseAddressesApi
    Normalize.config.japaneseAddressesApi =
      'https://japanese-addresses-dev.geolonia.com/next/ja'
    const result = await normalize(
      '東京都世田谷区北烏山６−２２−２２ おはようビル',
      {
        geoloniaApiKey: 'YOUR-API-KEY',
      },
    )
    expect(result.level).toEqual(8)
    // clean up
    Normalize.config.japaneseAddressesApi = default_url
  })
})
