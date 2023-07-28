import * as Normalize from './normalize'
import { promises as fs } from 'fs'
import unfetch from 'isomorphic-unfetch'
import { TransformRequestQuery } from './normalize'

export const requestHandlers = {
  file: (fileURL: URL) => {
    const filePath =
      process.platform === 'win32'
        ? decodeURI(fileURL.pathname).substr(1)
        : decodeURI(fileURL.pathname)
    return {
      json: async () => {
        const contents = await fs.readFile(filePath)
        return JSON.parse(contents.toString('utf-8'))
      },
    }
  },
  http: (fileURL: URL) => {
    if (Normalize.config.geoloniaApiKey) {
      fileURL.search = `?geolonia-api-key=${Normalize.config.geoloniaApiKey}`
    }
    return unfetch(fileURL.toString())
  },
}

/**
 * 正規化のためのデータを取得する
 * @param input - Path part like '東京都/文京区.json'
 * @param requestOptions - input を構造化したデータ
 */
const fetchOrReadFile = async (
  input: string,
  requestOptions: TransformRequestQuery = { level: -1 },
): Promise<Response | { json: () => Promise<unknown> }> => {
  const fileURL = new URL(`${Normalize.config.japaneseAddressesApi}${input}`)
  if (Normalize.config.transformRequest && requestOptions.level !== -1) {
    const result = await Normalize.config.transformRequest(
      fileURL,
      requestOptions,
    )
    return {
      json: async () => Promise.resolve(result),
    }
  } else {
    if (fileURL.protocol === 'http:' || fileURL.protocol === 'https:') {
      return requestHandlers.http(fileURL)
    } else if (fileURL.protocol === 'file:') {
      return requestHandlers.file(fileURL)
    } else {
      throw new Error(`Unknown URL schema: ${fileURL.protocol}`)
    }
  }
}

Normalize.__internals.fetch = fetchOrReadFile
export const config = Normalize.config
export const normalize = Normalize.normalize
