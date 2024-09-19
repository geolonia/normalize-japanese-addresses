import * as Normalize from './normalize'
import { promises as fs } from 'fs'
import unfetch from 'isomorphic-unfetch'
import { TransformRequestQuery } from './normalize'

export const requestHandlers = {
  file: async (fileURL: URL, options?: Normalize.FetchOptions) => {
    const o = options || {}
    const filePath =
      process.platform === 'win32'
        ? decodeURI(fileURL.pathname).substring(1)
        : decodeURI(fileURL.pathname)
    const f = await fs.open(filePath, 'rb')
    let contents: Buffer
    if (typeof o.length !== 'undefined' && typeof o.offset !== 'undefined') {
      contents = Buffer.alloc(o.length)
      await f.read(contents, 0, o.length, o.offset)
    } else {
      contents = await f.readFile()
    }
    await f.close()
    return {
      json: async () => {
        return JSON.parse(contents.toString('utf-8'))
      },
      text: async () => {
        return contents.toString('utf-8')
      },
    }
  },
  http: (fileURL: URL, options?: Normalize.FetchOptions) => {
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
    return unfetch(fileURL.toString(), {
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
  options?: Normalize.FetchOptions,
  requestOptions: TransformRequestQuery = { level: -1 },
): Promise<
  Response | { json: () => Promise<unknown>; text: () => Promise<string> }
> => {
  const fileURL = new URL(`${Normalize.config.japaneseAddressesApi}${input}`)
  if (Normalize.config.transformRequest && requestOptions.level !== -1) {
    const result = await Normalize.config.transformRequest(
      fileURL,
      requestOptions,
    )
    return {
      json: async () => result,
      text: async () => JSON.stringify(result),
    }
  } else {
    if (fileURL.protocol === 'http:' || fileURL.protocol === 'https:') {
      return requestHandlers.http(fileURL, options)
    } else if (fileURL.protocol === 'file:') {
      return requestHandlers.file(fileURL, options)
    } else {
      throw new Error(`Unknown URL schema: ${fileURL.protocol}`)
    }
  }
}

Normalize.__internals.fetch = fetchOrReadFile
export const config = Normalize.config
export const normalize = Normalize.normalize
