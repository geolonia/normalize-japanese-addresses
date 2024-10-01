import { Config } from './normalize'

export const defaultEndpoint =
  'https://japanese-addresses-v2.geoloniamaps.com/api/ja'

export const currentConfig: Config = {
  japaneseAddressesApi: defaultEndpoint,
  cacheSize: 1_000,
  backendTimeout: 600,
  backendTries: 3,
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

const timeoutableFetch = async (
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  input: RequestInfo,
  init: RequestInit | undefined,
  timeout: number,
) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  const response = await fetch(input, { ...init, signal: controller.signal })
  clearTimeout(timeoutId)
  return response
}

export async function fetchWithTimeoutRetry(
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  input: RequestInfo,
  init?: RequestInit,
) {
  let tries = 0
  while (true) {
    try {
      return timeoutableFetch(fetch, input, init, currentConfig.backendTimeout)
    } catch (error) {
      tries++
      if (tries >= currentConfig.backendTries) {
        throw error
      }
    }
  }
}

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
    return fetchWithTimeoutRetry(window.fetch, url, {
      headers,
    })
  },
}
