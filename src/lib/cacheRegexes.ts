import { toRegexPattern } from './dict'
import { kan2num } from './kan2num'
import LRU from 'lru-cache'
import { currentConfig } from '../config'
import { __internals } from '../normalize'
import { findKanjiNumbers } from '@geolonia/japanese-numeral'

export type PrefectureList = { [key: string]: string[] }
interface SingleTown {
  town: string
  originalTown?: string
  koaza: string
  lat: string
  lng: string
}
export type TownList = SingleTown[]
interface SingleAddr {
  addr: string
  lat: string | null
  lng: string | null
}
export type AddrList = SingleAddr[]
interface GaikuListItem {
  gaiku: string
  lat: string
  lng: string
}

interface SingleResidential {
  gaiku: string
  jyukyo: string
  lat: string
  lng: string
}
type ResidentialList = SingleResidential[]

const cachedTownRegexes = new LRU<string, [SingleTown, string][]>({
  max: currentConfig.townCacheSize,
  maxAge: 60 * 60 * 24 * 7 * 1000, // 7日間
})

let cachedPrefecturePatterns: [string, string][] | undefined = undefined
const cachedCityPatterns: { [key: string]: [string, string][] } = {}
let cachedPrefectures: PrefectureList | undefined = undefined
const cachedTowns: { [key: string]: TownList } = {}
const cachedGaikuListItem: { [key: string]: GaikuListItem[] } = {}
const cachedResidentials: { [key: string]: ResidentialList } = {}
const cachedAddrs: { [key: string]: AddrList } = {} // TODO: use LRU
let cachedSameNamedPrefectureCityRegexPatterns: [string, string][] | undefined =
  undefined

export const getPrefectures = async () => {
  if (typeof cachedPrefectures !== 'undefined') {
    return cachedPrefectures
  }

  const prefsResp = await __internals.fetch('.json', { level: 1 }) // ja.json
  const data = (await prefsResp.json()) as PrefectureList
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

  const townsResp = await __internals.fetch(
    ['', encodeURI(pref), encodeURI(city) + '.json'].join('/'),
    { level: 3, pref, city },
  )
  const towns = (await townsResp.json()) as TownList
  return (cachedTowns[cacheKey] = towns)
}

export const getGaikuList = async (
  pref: string,
  city: string,
  town: string,
) => {
  if (currentConfig.interfaceVersion > 1) {
    throw new Error(
      `Invalid config.interfaceVersion: ${currentConfig.interfaceVersion}'}. Please set config.interfaceVersion to 1.`,
    )
  }

  const cacheKey = `${pref}-${city}-${town}-v${currentConfig.interfaceVersion}`
  const cache = cachedGaikuListItem[cacheKey]
  if (typeof cache !== 'undefined') {
    return cache
  }
  const gaikuResp = await __internals.fetch(
    ['', encodeURI(pref), encodeURI(city), encodeURI(town + '.json')].join('/'),
  )
  let gaikuListItem: GaikuListItem[]
  try {
    gaikuListItem = (await gaikuResp.json()) as GaikuListItem[]
  } catch {
    gaikuListItem = []
  }
  return (cachedGaikuListItem[cacheKey] = gaikuListItem)
}

export const getResidentials = async (
  pref: string,
  city: string,
  town: string,
) => {
  if (currentConfig.interfaceVersion > 1) {
    throw new Error(
      `Invalid config.interfaceVersion: ${currentConfig.interfaceVersion}'}. Please set config.interfaceVersion to 1.`,
    )
  }

  const cacheKey = `${pref}-${city}-${town}-v${currentConfig.interfaceVersion}`
  const cache = cachedResidentials[cacheKey]
  if (typeof cache !== 'undefined') {
    return cache
  }

  const residentialsResp = await __internals.fetch(
    [
      '',
      encodeURI(pref),
      encodeURI(city),
      encodeURI(town),
      encodeURI('住居表示.json'),
    ].join('/'),
  )
  let residentials: ResidentialList
  try {
    residentials = (await residentialsResp.json()) as ResidentialList
  } catch {
    residentials = []
  }

  residentials.sort(
    (res1, res2) =>
      `${res2.gaiku}-${res2.jyukyo}`.length -
      `${res1.gaiku}-${res1.jyukyo}`.length,
  )
  return (cachedResidentials[cacheKey] = residentials)
}

export const getAddrs = async (pref: string, city: string, town: string) => {
  if (currentConfig.interfaceVersion < 2) {
    throw new Error(
      `Invalid config.interfaceVersion: ${currentConfig.interfaceVersion}'}. Please set config.interfaceVersion to 2 or higher`,
    )
  }

  const cacheKey = `${pref}-${city}-${town}-v${currentConfig.interfaceVersion}`
  const cache = cachedAddrs[cacheKey]
  if (typeof cache !== 'undefined') {
    return cache
  }

  const addrsResp = await __internals.fetch(
    ['', encodeURI(pref), encodeURI(city), encodeURI(town) + '.json'].join('/'),
    { level: 8, pref, city, town },
  )
  let addrs: AddrList
  try {
    addrs = (await addrsResp.json()) as AddrList
  } catch {
    addrs = []
  }

  addrs.sort((res1, res2) => res1.addr.length - res2.addr.length)
  return (cachedAddrs[cacheKey] = addrs)
}

// 十六町 のように漢数字と町が連結しているか
const isKanjiNumberFollewedByCho = (targetTownName: string) => {
  const xCho = targetTownName.match(/.町/g)
  if (!xCho) return false
  const kanjiNumbers = findKanjiNumbers(xCho[0])
  return kanjiNumbers.length > 0
}

export const getTownRegexPatterns = async (pref: string, city: string) => {
  const cachedResult = cachedTownRegexes.get(`${pref}-${city}`)
  if (typeof cachedResult !== 'undefined') {
    return cachedResult
  }

  const pre_towns = await getTowns(pref, city)
  const townSet = new Set(pre_towns.map((town) => town.town))
  const towns = []

  const isKyoto = city.match(/^京都市/)

  // 町丁目に「○○町」が含まれるケースへの対応
  // 通常は「○○町」のうち「町」の省略を許容し同義語として扱うが、まれに自治体内に「○○町」と「○○」が共存しているケースがある。
  // この場合は町の省略は許容せず、入力された住所は書き分けられているものとして正規化を行う。
  // 更に、「愛知県名古屋市瑞穂区十六町1丁目」漢数字を含むケースだと丁目や番地・号の正規化が不可能になる。このようなケースも除外。
  for (const town of pre_towns) {
    towns.push(town)

    const originalTown = town.town
    if (originalTown.indexOf('町') === -1) continue
    const townAbbr = originalTown.replace(/(?!^町)町/g, '') // NOTE: 冒頭の「町」は明らかに省略するべきではないので、除外
    if (
      !isKyoto && // 京都は通り名削除の処理があるため、意図しないマッチになるケースがある。これを除く
      !townSet.has(townAbbr) &&
      !townSet.has(`大字${townAbbr}`) && // 大字は省略されるため、大字〇〇と〇〇町がコンフリクトする。このケースを除外
      !isKanjiNumberFollewedByCho(originalTown)
    ) {
      // エイリアスとして町なしのパターンを登録
      towns.push({
        ...town,
        originalTown,
        town: townAbbr,
      })
    }
  }

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
    return [town, pattern]
  }) as [SingleTown, string][]

  // X丁目の丁目なしの数字だけ許容するため、最後に数字だけ追加していく
  for (const town of towns) {
    const chomeMatch = town.town.match(
      /([^一二三四五六七八九十]+)([一二三四五六七八九十]+)(丁目?)/,
    )
    if (!chomeMatch) {
      continue
    }
    const chomeNamePart = chomeMatch[1]
    const chomeNum = chomeMatch[2]
    const pattern = toRegexPattern(
      `^${chomeNamePart}(${chomeNum}|${kan2num(chomeNum)})`,
    )
    patterns.push([town, pattern])
  }

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
