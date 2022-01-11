import { DataFetcher } from '../../normalize'
import fs from 'fs'
import path from 'path'

export const fetchLocalData: DataFetcher = async (url: string) => {
  const pathToApi = path.resolve(
    require.resolve('@geolonia/japanese-addresses'),
    '..',
    '..',
    'api',
    'ja',
  )
  const data = fs.readFileSync(`${pathToApi}${url}`).toString('utf-8')
  return { json: async () => JSON.parse(data) }
}
