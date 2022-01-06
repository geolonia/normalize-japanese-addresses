import { currentConfig } from '../config'
import unfetch from 'isomorphic-unfetch'
import path from 'path'

let preloadedDir: string | false = false

export const fetchSim = async (url: string) => {
  if (currentConfig.preloadTownCache) {
    const fs = require('fs')
    if (!preloadedDir) preloadedDir = await preloadCache()

    const data = fs.readFileSync(`${preloadedDir}${url}`).toString('utf-8')
    return { json: async () => JSON.parse(data) }
  } else {
    return unfetch(`${currentConfig.japaneseAddressesApi}${encodeURI(url)}`)
  }
}

export const preloadCache = async (): Promise<string> => {
  const fs = require('fs')
  const unzipper = require('unzipper')

  const pathToExtract = path.resolve(__dirname, '..', '..', 'tmp')
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

  const expiresAt =
    new Date().getTime() + currentConfig.preloadedTownCacheExpiresIn
  fs.writeFileSync(pathOfExpirationNote, expiresAt.toString())

  const resp = await unfetch(
    'https://github.com/geolonia/japanese-addresses/archive/refs/heads/master.zip',
  )
  const zip = Buffer.from(await resp.arrayBuffer())

  const directory = await unzipper.Open.buffer(zip)
  await directory.extract({ path: pathToExtract })
  return extractedPath
}
