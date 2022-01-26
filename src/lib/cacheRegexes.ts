import { toRegexPattern } from './dict'
import { kan2num } from './kan2num'
import { currentConfig } from '../config'
import LRU from 'lru-cache'
import { __internals } from '../normalize'

type PrefectureList = { [key: string]: string[] }
interface SingleTown {
  town: string
  koaza: string
  lat: string
  lng: string
}
type TownList = SingleTown[]

const cachedTownRegexes = new LRU<string, [SingleTown, string][]>({
  max: currentConfig.townCacheSize,
  maxAge: 60 * 60 * 24 * 7 * 1000, // 7日間
})

let cachedPrefecturePatterns: [string, string][] | undefined = undefined
const cachedCityPatterns: { [key: string]: [string, string][] } = {}
let cachedPrefectures: PrefectureList | undefined = undefined
const cachedTowns: { [key: string]: TownList } = {}
let cachedSameNamedPrefectureCityRegexPatterns: [string, string][] | undefined =
  undefined

export const getPrefectures = async () => {
  if (typeof cachedPrefectures !== 'undefined') {
    return cachedPrefectures
  }

  const resp = await __internals.fetch('.json') // ja.json
  const data = (await resp.json()) as PrefectureList
  return cachePrefectures(data)
}

export const cachePrefectures = (data: PrefectureList) => {
  return (cachedPrefectures = data)
}

export const getPrefectureRegexPatterns = (prefs: string[]) => {
  if (cachedPrefecturePatterns) {
    return cachedPrefecturePatterns
  }

  cachedPrefecturePatterns = prefs.map((pref) => {
    const _pref = pref.replace(/(都|道|府|県)$/, '') // `東京` の様に末尾の `都府県` が抜けた住所に対応
    const pattern = `^${_pref}(都|道|府|県)?`
    return [pref, pattern]
  })

  return cachedPrefecturePatterns
}

export const getCityRegexPatterns = (pref: string, cities: string[]) => {
  const cachedResult = cachedCityPatterns[pref]
  if (typeof cachedResult !== 'undefined') {
    return cachedResult
  }

  // 少ない文字数の地名に対してミスマッチしないように文字の長さ順にソート
  cities.sort((a: string, b: string) => {
    return b.length - a.length
  })

  const patterns = cities.map((city) => {
    let pattern = `^${toRegexPattern(city)}`
    if (city.match(/(町|村)$/)) {
      pattern = `^${toRegexPattern(city).replace(/(.+?)郡/, '($1郡)?')}` // 郡が省略されてるかも
    }
    return [city, pattern] as [string, string]
  })

  cachedCityPatterns[pref] = patterns
  return patterns
}

export const getTowns = async (pref: string, city: string) => {
  const cacheKey = `${pref}-${city}`
  const cachedTown = cachedTowns[cacheKey]
  if (typeof cachedTown !== 'undefined') {
    return cachedTown
  }

  const responseTownsResp = await __internals.fetch(
    ['', encodeURI(pref), encodeURI(city) + '.json'].join('/'),
  )
  const towns = (await responseTownsResp.json()) as TownList
  return (cachedTowns[cacheKey] = towns)
}

export const getTownRegexPatterns = async (pref: string, city: string) => {
  const cachedResult = cachedTownRegexes.get(`${pref}-${city}`)
  if (typeof cachedResult !== 'undefined') {
    return cachedResult
  }

  const towns = await getTowns(pref, city)

  // 少ない文字数の地名に対してミスマッチしないように文字の長さ順にソート
  towns.sort((a, b) => {
    let aLen = a.town.length
    let bLen = b.town.length

    // 大字で始まる場合、優先度を低く設定する。
    // 大字XX と XXYY が存在するケースもあるので、 XXYY を先にマッチしたい
    if (a.town.startsWith('大字')) aLen -= 2
    if (b.town.startsWith('大字')) bLen -= 2

    return bLen - aLen
  })

  const patterns = towns.map((town) => {
    const pattern = toRegexPattern(
      town.town
        // 横棒を含む場合（流通センター、など）に対応
        .replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, '[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]')
        .replace(/大?字/g, '(大?字)?')
        // 以下住所マスターの町丁目に含まれる数字を正規表現に変換する
        .replace(
          /([壱一二三四五六七八九十]+)(丁目?|番(町|丁)|条|軒|線|(の|ノ)町|地割|号)/g,
          (match: string) => {
            const patterns = []

            patterns.push(
              match
                .toString()
                .replace(/(丁目?|番(町|丁)|条|軒|線|(の|ノ)町|地割|号)/, ''),
            ) // 漢数字

            if (match.match(/^壱/)) {
              patterns.push('一')
              patterns.push('1')
              patterns.push('１')
            } else {
              const num = match
                .replace(/([一二三四五六七八九十]+)/g, (match) => {
                  return kan2num(match)
                })
                .replace(/(丁目?|番(町|丁)|条|軒|線|(の|ノ)町|地割|号)/, '')

              patterns.push(num.toString()) // 半角アラビア数字
            }

            // 以下の正規表現は、上のよく似た正規表現とは違うことに注意！
            const _pattern = `(${patterns.join(
              '|',
            )})((丁|町)目?|番(町|丁)|条|軒|線|の町?|地割|号|[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━])`

            return _pattern // デバッグのときにめんどくさいので変数に入れる。
          },
        ),
    )

    if (city.match(/^京都市/)) {
      return [town, `.*${pattern}`]
    } else {
      return [town, `^${pattern}`]
    }
  }) as [SingleTown, string][]

  cachedTownRegexes.set(`${pref}-${city}`, patterns)
  return patterns
}

export const getSameNamedPrefectureCityRegexPatterns = (
  prefs: string[],
  prefList: PrefectureList,
) => {
  if (typeof cachedSameNamedPrefectureCityRegexPatterns !== 'undefined') {
    return cachedSameNamedPrefectureCityRegexPatterns
  }

  const _prefs = prefs.map((pref) => {
    return pref.replace(/[都|道|府|県]$/, '')
  })

  cachedSameNamedPrefectureCityRegexPatterns = []
  for (const pref in prefList) {
    for (let i = 0; i < prefList[pref].length; i++) {
      const city = prefList[pref][i]

      // 「福島県石川郡石川町」のように、市の名前が別の都道府県名から始まっているケースも考慮する。
      for (let j = 0; j < _prefs.length; j++) {
        if (city.indexOf(_prefs[j]) === 0) {
          cachedSameNamedPrefectureCityRegexPatterns.push([
            `${pref}${city}`,
            `^${city}`,
          ])
        }
      }
    }
  }

  return cachedSameNamedPrefectureCityRegexPatterns
}
