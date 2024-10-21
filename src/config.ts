import { Config } from './normalize'

// export const defaultEndpoint = 'http://localhost:8080/api/ja'
export const defaultEndpoint =
  'https://japanese-addresses-v2.geoloniamaps.com/api/ja'

export const currentConfig: Config = {
  japaneseAddressesApi: defaultEndpoint,
  cacheSize: 1_000,
  backendTimeout: 1_500,
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
  const response = await fetch(input, {
    ...init,
    signal: AbortSignal.timeout(timeout),
  })
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
      // await needs to be in this try block, otherwise it won't be caught
      const resp = await timeoutableFetch(
        fetch,
        input,
        init,
        currentConfig.backendTimeout,
      )
      return resp
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
    let globalFetch: typeof fetch
    if (typeof fetch !== 'undefined') {
      globalFetch = fetch
    } else if (typeof window !== 'undefined') {
      globalFetch = window.fetch
    } else {
      throw new Error('fetch is not available in this environment')
    }
    return fetchWithTimeoutRetry(globalFetch, url, {
      headers,
    })
  },
}
