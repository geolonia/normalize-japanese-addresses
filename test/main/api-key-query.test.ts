import { afterEach, describe, test, mock } from 'node:test'
import assert from 'node:assert/strict'
import { config, requestHandlers } from '../../src/main-node'

const originalKey = config.geoloniaApiKey
const originalEndpoint = config.japaneseAddressesApi

afterEach(() => {
  mock.restoreAll()
  config.geoloniaApiKey = originalKey
  config.japaneseAddressesApi = originalEndpoint
})

describe('API key query parameters', () => {
  for (const runtime of ['node', 'browser']) {
    test(`${runtime} preserves data version and encodes the API key`, async () => {
      let requestURL: URL | undefined
      mock.method(globalThis, 'fetch', async (input: string) => {
        requestURL = new URL(input)
        return new Response('{}')
      })
      config.geoloniaApiKey = 'key&value=日本語#'
      if (runtime === 'node') {
        await requestHandlers.http(
          new URL('https://example.invalid/data.json?v=7&source=fixture'),
        )
      } else {
        // main-node installs its handler at import time; isolate the browser
        // default in a fresh module instance without changing the live handler.
        const { __internals: browser, currentConfig } = await import(
          `../../src/config?browser-query-test=${Date.now()}`
        )
        currentConfig.geoloniaApiKey = config.geoloniaApiKey
        currentConfig.japaneseAddressesApi = 'https://example.invalid'
        await browser.fetch('/data.json?v=7&source=fixture')
      }
      assert.equal(requestURL?.searchParams.get('v'), '7')
      assert.equal(requestURL?.searchParams.get('source'), 'fixture')
      assert.equal(
        requestURL?.searchParams.get('geolonia-api-key'),
        'key&value=日本語#',
      )
      assert.equal(requestURL?.hash, '')
    })
  }
})
