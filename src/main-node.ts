import {
  cachePrefectures,
  cachedTownRegexes,
  getTownRegexPatterns,
  TownList,
} from './lib/cacheRegexes'
import unzipper from 'unzipper'
import * as Normalize from './normalize'
import fs from 'fs'
import { currentConfig } from './config'

let preloaded = false

/**
 * あらかじめ市区町村のデータを読み込みキャッシュします。
 * この関数は Node.js でのみ有効です。
 */
export const preload = async () => {
  if (preloaded) {
    return
  } else {
    preloaded = true
  }

  cachedTownRegexes.max = Infinity
  let zipBuffer: Buffer

  // file:// でローカルにダウンロードした zip ファイルを参照する。
  // https://github.com/geolonia/japanese-addresses のリポジトリと同じ構造を持つものを想定
  if (currentConfig.japaneseAddressesApi.startsWith('file://')) {
    zipBuffer = fs.readFileSync(
      currentConfig.japaneseAddressesApi.replace(/^file:\//, ''),
    )
  } else {
    return
  }

  const japaneseAddresses = await unzipper.Open.buffer(zipBuffer)
  for (const file of japaneseAddresses.files) {
    if (
      file.type === 'File' &&
      // <リポジトリ名>/api/ja
      file.path.match(/^(.+)\/api\/ja\//) &&
      file.path.endsWith('.json')
    ) {
      const matches = file.path.match(/(.+)\/api\/ja\/(.+)\/(.+)\.json$/)
      if (!matches) continue
      const [, , pref, city] = matches
      const townBuffer = await file.buffer()
      const towns = JSON.parse(townBuffer.toString('utf-8')) as TownList
      await getTownRegexPatterns(pref, city, towns) // call and set cache
    } else if (
      file.type === 'File' &&
      file.path.match(/^(.+)\/api\/ja\.json$/)
    ) {
      const prefecturesBuffer = await file.buffer()
      cachePrefectures(JSON.parse(prefecturesBuffer.toString('utf-8')))
    }
  }

  return
}

export const config = currentConfig
export const normalize: Normalize.Normalizer =
  Normalize.createNormalizer(preload)
