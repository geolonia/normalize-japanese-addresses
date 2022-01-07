import { currentConfig } from '../../config'
import unfetch from 'isomorphic-unfetch'
import path from 'path'
import fs from 'fs'
import unzipper from 'unzipper'
import { DataFetcher } from '../../normalize'
import { fetchData } from './browser'

let preloadedDir: string | false = false

export const fetchLocalData: DataFetcher = async (url: string) => {
  if (currentConfig.preloadCache) {
    if (!preloadedDir) {
      preloadedDir = await preloadJapaneseAddresses(
        currentConfig.preloadedCacheExpiresIn,
      )
    }
    const data = fs.readFileSync(`${preloadedDir}${url}`).toString('utf-8')
    return { json: async () => JSON.parse(data) }
  } else {
    return fetchData(url)
  }
}

export const preloadJapaneseAddresses = async (
  expiresIn: number,
): Promise<string> => {
  const pathToExtract = path.resolve(__dirname, '..', 'tmp') // resolved with only in bundled file
  const pathOfExpirationNote = path.resolve(pathToExtract, 'expires_at')
  const extractedPath = path.resolve(
    pathToExtract,
    'japanese-addresses-master',
    'api',
    'ja',
  )
  let isExpired = true
  try {
    let expiresAt = parseInt(
      fs.readFileSync(pathOfExpirationNote).toString(),
      10,
    )
    expiresAt = Number.isNaN(expiresAt) ? 0 : expiresAt
    isExpired = expiresAt < new Date().getTime()
  } catch {}

  if (fs.existsSync(extractedPath) && !isExpired) {
    return extractedPath
  }

  fs.rmSync(pathToExtract, { recursive: true, force: true })
  fs.mkdirSync(pathToExtract, { recursive: true })

  const expiresAt = new Date().getTime() + expiresIn
  fs.writeFileSync(pathOfExpirationNote, expiresAt.toString())

  const resp = await unfetch(
    'https://github.com/geolonia/japanese-addresses/archive/refs/heads/master.zip',
  )
  const zip = Buffer.from(await resp.arrayBuffer())

  const directory = await unzipper.Open.buffer(zip)
  await directory.extract({ path: pathToExtract })
  return extractedPath
}
