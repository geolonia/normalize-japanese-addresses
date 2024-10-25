import * as Normalize from './normalize'
import { __internals, FetchOptions, FetchResponseLike } from './config'
import { promises as fs } from 'node:fs'
import { fetch } from 'undici'

export const requestHandlers = {
  file: async (fileURL: URL, options?: FetchOptions) => {
    const o = options || {}
    const filePath =
      process.platform === 'win32'
        ? decodeURI(fileURL.pathname).substring(1)
        : decodeURI(fileURL.pathname)
    const f = await fs.open(filePath, 'r')
    let contents: Buffer, ok: boolean
    if (typeof o.length !== 'undefined' && typeof o.offset !== 'undefined') {
      contents = Buffer.alloc(o.length)
      const resp = await f.read(contents, 0, o.length, o.offset)
      ok = resp.bytesRead === o.length
    } else {
      contents = await f.readFile()
      ok = true
    }
    await f.close()
    return {
      json: async () => {
        return JSON.parse(contents.toString('utf-8'))
      },
      text: async () => {
        return contents.toString('utf-8')
      },
      ok,
    }
  },
  http: (fileURL: URL, options?: FetchOptions) => {
    const o = options || {}
    if (Normalize.config.geoloniaApiKey) {
      fileURL.search = `?geolonia-api-key=${Normalize.config.geoloniaApiKey}`
    }
    const headers: HeadersInit = {
      'User-Agent':
        'normalize-japanese-addresses/0.1 (+https://github.com/geolonia/normalize-japanese-addresses/)',
    }
    if (typeof o.length !== 'undefined' && typeof o.offset !== 'undefined') {
      headers['Range'] = `bytes=${o.offset}-${o.offset + o.length - 1}`
    }
    return fetch(fileURL.toString(), {
      headers,
    })
  },
}

/**
 * 正規化のためのデータを取得する
 * @param input - Path part like '東京都/文京区.json'
 * @param requestOptions - input を構造化したデータ
 */
const fetchOrReadFile = async (
  input: string,
  options?: FetchOptions,
): Promise<FetchResponseLike> => {
  const fileURL = new URL(`${Normalize.config.japaneseAddressesApi}${input}`)
  if (fileURL.protocol === 'http:' || fileURL.protocol === 'https:') {
    return requestHandlers.http(fileURL, options)
  } else if (fileURL.protocol === 'file:') {
    return requestHandlers.file(fileURL, options)
  } else {
    throw new Error(`Unknown URL schema: ${fileURL.protocol}`)
  }
}

__internals.fetch = fetchOrReadFile
export const version = Normalize.version
export const config = Normalize.config
export const normalize = Normalize.normalize
