import unfetch from 'isomorphic-unfetch'
import {
  cachedTownRegexes,
  getTownRegexPatterns,
  TownList,
} from './lib/cacheRegexes'
import unzipper from 'unzipper'
import * as Normalize from './normalize'

export const preloader = async () => {
  console.log('Now preloading..')
  cachedTownRegexes.max = Infinity
  const resp = await unfetch(
    'https://github.com/geolonia/japanese-addresses/archive/refs/heads/master.zip',
  )
  const zipBuffer = Buffer.from(await resp.arrayBuffer())
  const japaneseAddresses = await unzipper.Open.buffer(zipBuffer)
  for (const file of japaneseAddresses.files) {
    if (
      file.type === 'File' &&
      file.path.startsWith('japanese-addresses-master/api/ja/') &&
      file.path.endsWith('.json')
    ) {
      const matches = file.path.match(
        /japanese-addresses-master\/api\/ja\/(.+)\/(.+)\.json$/,
      )
      if (!matches) continue
      const [, pref, city] = matches
      const townBuffer = await file.buffer()
      const towns = JSON.parse(townBuffer.toString('utf-8')) as TownList
      getTownRegexPatterns(pref, city, towns) // call and set cache
    }
  }
  console.log(cachedTownRegexes)

  console.log(`${cachedTownRegexes.length} towns have been reloaded.`)
}

export const normalize = Normalize.createNormalizer(preloader)
export const config = Normalize.config
