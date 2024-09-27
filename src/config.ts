import { Config } from './normalize'

export const defaultEndpoint =
  'https://japanese-addresses-v2.geoloniamaps.com/api/ja'

export const currentConfig: Config = {
  japaneseAddressesApi: defaultEndpoint,
  cacheSize: 1_000,
}

export type FetchOptions = {
  offset?: number
  length?: number
}

export type FetchResponseLike = {
  json: () => Promise<unknown>
  text: () => Promise<string>
  ok: boolean
}

export type FetchLike = (
  input: string,
  options?: FetchOptions,
) => Promise<FetchResponseLike>

/**
 * @internal
 */
export const __internals: { fetch: FetchLike } = {
  // default fetch
  fetch: (input: string, options) => {
    const o = options || {}
    let url = new URL(
      `${currentConfig.japaneseAddressesApi}${input}`,
    ).toString()
    if (currentConfig.geoloniaApiKey) {
      url += `?geolonia-api-key=${currentConfig.geoloniaApiKey}`
    }
    const headers: HeadersInit = {}
    if (typeof o.length !== 'undefined' && typeof o.offset !== 'undefined') {
      headers['Range'] = `bytes=${o.offset}-${o.offset + o.length - 1}`
    }
    return window.fetch(url, {
      headers,
    })
  },
}
