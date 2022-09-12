import * as Normalize from './normalize'
import { promises as fs } from 'fs'
import unfetch from 'isomorphic-unfetch'

const fetchOrReadFile = async (
  input: string,
): Promise<Response | { json: () => Promise<unknown> }> => {
  const fileURL = new URL(`${Normalize.config.japaneseAddressesApi}${input}`)
  if (fileURL.protocol === 'http:' || fileURL.protocol === 'https:') {
    if (Normalize.config.geoloniaApiKey) {
      fileURL.search = `?geolonia-api-key=${Normalize.config.geoloniaApiKey}`
    }
    return unfetch(fileURL.toString())
  } else if (fileURL.protocol === 'file:') {
    const filePath = decodeURI(fileURL.pathname)
    return {
      json: async () => {
        const contents = await fs.readFile(filePath)
        return JSON.parse(contents.toString('utf-8'))
      },
    }
  } else {
    throw new Error(`Unknown URL schema: ${fileURL.protocol}`)
  }
}

Normalize.__internals.fetch = fetchOrReadFile
export const config = Normalize.config
export const normalize = Normalize.normalize
