import * as Normalize from './normalize'
import { currentConfig } from './config'
import fs from 'fs'
import unfetch from 'isomorphic-unfetch'

const fetchOrReadFile = async (
  input: string,
): Promise<Response | { json: () => Promise<unknown> }> => {
  const fileURL = `${currentConfig.japaneseAddressesApi}${input}`
  if (fileURL.startsWith('http://') || fileURL.startsWith('https://')) {
    return unfetch(fileURL)
  } else if (fileURL.startsWith('file://')) {
    const filePath = decodeURI(fileURL.replace(/^file:\//, ''))
    const json = JSON.parse(fs.readFileSync(filePath).toString('utf-8'))
    return {
      json: async () => json,
    }
  } else {
    throw new Error(`Unknown URL schema: ${fileURL.startsWith}`)
  }
}

Normalize.__fetch.shim = fetchOrReadFile
export const config = currentConfig
export const normalize = Normalize.normalize
