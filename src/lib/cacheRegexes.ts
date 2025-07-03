import { toRegexPattern } from './dict'
import { kan2num } from './kan2num'
import Papaparse from 'papaparse'
import { LRUCache } from 'lru-cache'
import { currentConfig, __internals } from '../config'
import { findKanjiNumbers, kanji2number } from '@geolonia/japanese-numeral'
import {
  cityName,
  LngLat,
  MachiAzaApi,
  machiAzaName,
  PrefectureApi,
  prefectureName,
  SingleChiban,
  SingleCity,
  SingleMachiAza,
  SinglePrefecture,
  SingleRsdt,
} from '@geolonia/japanese-addresses-v2'

export type PrefectureList = PrefectureApi
// interface SingleTown {
//   town: string
//   originalTown?: string
//   koaza: string
//   lat: string
//   lng: string
// }
type SingleTown = SingleMachiAza
export type TownList = MachiAzaApi
interface SingleAddr {
  addr: string
  lat: string | null
  lng: string | null
}
export type AddrList = SingleAddr[]

const cache = new LRUCache({
  max: currentConfig.cacheSize,
})

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
async function fetchFromCache<T extends {}>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  let data = cache.get(key) as T | undefined
  if (typeof data !== 'undefined') {
    return data
  }
  data = await fetcher()
  cache.set(key, data)
  return data
}

let cachedPrefecturePatterns: [SinglePrefecture, string][] | undefined =
  undefined
const cachedCityPatterns: Map<number, [SingleCity, string][]> = new Map()
let cachedPrefectures: PrefectureList | undefined = undefined
const cachedTowns: { [key: string]: TownList } = {}
let cachedSameNamedPrefectureCityRegexPatterns: [string, string][] | undefined =
  undefined

export const getPrefectures = async () => {
  if (typeof cachedPrefectures !== 'undefined') {
    return cachedPrefectures
  }

  const prefsResp = await __internals.fetch('.json', {}) // ja.json
  const data = (await prefsResp.json()) as PrefectureApi
  return cachePrefectures(data)
}

export const cachePrefectures = (data: PrefectureList) => {
  return (cachedPrefectures = data)
}

export const getPrefectureRegexPatterns = (api: PrefectureApi) => {
  if (cachedPrefecturePatterns) {
    return cachedPrefecturePatterns
  }

  const data = api.data
  cachedPrefecturePatterns = data.map<[SinglePrefecture, string]>((pref) => {
    const _pref = pref.pref.replace(/(都|道|府|県)$/, '') // `東京` の様に末尾の `都府県` が抜けた住所に対応
    const pattern = `^${_pref}(都|道|府|県)?`
    return [pref, pattern]
  })

  return cachedPrefecturePatterns
}

export const getCityRegexPatterns = (pref: SinglePrefecture) => {
  const cachedResult = cachedCityPatterns.get(pref.code)
  if (typeof cachedResult !== 'undefined') {
    return cachedResult
  }

  const cities = pref.cities
  // 少ない文字数の地名に対してミスマッチしないように文字の長さ順にソート
  cities.sort((a, b) => {
    return cityName(a).length - cityName(b).length
  })

  const patterns = cities.map<[SingleCity, string]>((city) => {
    const name = cityName(city)
    let pattern = `^${toRegexPattern(name)}`
    if (name.match(/(町|村)$/)) {
      pattern = `^${toRegexPattern(name).replace(/(.+?)郡/, '($1郡)?')}` // 郡が省略されてるかも
    }
    return [city, pattern]
  })

  cachedCityPatterns.set(pref.code, patterns)
  return patterns
}

export const getTowns = async (
  prefObj: SinglePrefecture,
  cityObj: SingleCity,
  apiVersion: number,
) => {
  const pref = prefectureName(prefObj)
  const city = cityName(cityObj)

  const cacheKey = `${pref}-${city}`
  const cachedTown = cachedTowns[cacheKey]
  if (typeof cachedTown !== 'undefined') {
    return cachedTown
  }

  const townsResp = await __internals.fetch(
    ['', encodeURI(pref), encodeURI(city) + `.json?v=${apiVersion}`].join('/'),
    {},
  )
  const towns = (await townsResp.json()) as MachiAzaApi
  return (cachedTowns[cacheKey] = towns)
}

type MetadataRow = { start: number; length: number }

async function fetchSubresource(
  kind: '地番' | '住居表示',
  pref: SinglePrefecture,
  city: SingleCity,
  row: MetadataRow,
  apiVersion: number,
) {
  const prefN = prefectureName(pref)
  const cityN = cityName(city)
  const resp = await __internals.fetch(
    [
      '',
      encodeURI(prefN),
      encodeURI(`${cityN}-${kind}.txt?v=${apiVersion}`),
    ].join('/'),
    {
      offset: row.start,
      length: row.length,
    },
  )
  return resp.text()
}

type RsdtDataRow = {
  blk_num: string
  rsdt_num: string
  rsdt_num2: string
  lng: string
  lat: string
}
type ChibanDataRow = {
  prc_num1: string
  prc_num2: string
  prc_num3: string
  lng: string
  lat: string
}
function parseSubresource<T extends SingleRsdt | SingleChiban>(
  data: string,
): T[] {
  const firstLineEnd = data.indexOf('\n')
  // const firstLine = data.slice(0, firstLineEnd)
  const rest = data.slice(firstLineEnd + 1)
  const lines = Papaparse.parse<RsdtDataRow | ChibanDataRow>(rest, {
    header: true,
  }).data
  const out: T[] = []
  for (const line of lines) {
    const point: LngLat | undefined =
      line.lng && line.lat
        ? [parseFloat(line.lng), parseFloat(line.lat)]
        : undefined
    if ('blk_num' in line) {
      out.push({
        blk_num: line.blk_num,
        rsdt_num: line.rsdt_num,
        rsdt_num2: line.rsdt_num2,
        point: point,
      } as T)
    } else if ('prc_num1' in line) {
      out.push({
        prc_num1: line.prc_num1,
        prc_num2: line.prc_num2,
        prc_num3: line.prc_num3,
        point: point,
      } as T)
    }
  }
  return out
}

export const getRsdt = async (
  pref: SinglePrefecture,
  city: SingleCity,
  town: SingleTown,
  apiVersion: number,
) => {
  const row = town.csv_ranges?.住居表示
  if (!row) {
    return []
  }

  const parsed = await fetchFromCache(
    `住居表示-${pref.code}-${city.code}-${machiAzaName(town)}`,
    async () => {
      const data = await fetchSubresource(
        '住居表示',
        pref,
        city,
        row,
        apiVersion,
      )
      const parsed = parseSubresource<SingleRsdt>(data)
      parsed.sort((a, b) => {
        const aStr = [a.blk_num, a.rsdt_num, a.rsdt_num2]
          .filter((a) => !!a)
          .join('-')
        const bStr = [b.blk_num, b.rsdt_num, b.rsdt_num2]
          .filter((a) => !!a)
          .join('-')
        return bStr.length - aStr.length
      })
      return parsed
    },
  )
  return parsed
}

export const getChiban = async (
  pref: SinglePrefecture,
  city: SingleCity,
  town: SingleTown,
  apiVersion: number,
) => {
  const row = town.csv_ranges?.地番
  if (!row) {
    return []
  }

  const parsed = await fetchFromCache(
    `地番-${pref.code}-${city.code}-${machiAzaName(town)}`,
    async () => {
      const data = await fetchSubresource('地番', pref, city, row, apiVersion)
      const parsed = parseSubresource<SingleChiban>(data)
      parsed.sort((a, b) => {
        const aStr = [a.prc_num1, a.prc_num2, a.prc_num3]
          .filter((a) => !!a)
          .join('-')
        const bStr = [b.prc_num1, b.prc_num2, b.prc_num3]
          .filter((a) => !!a)
          .join('-')
        return bStr.length - aStr.length
      })
      return parsed
    },
  )

  return parsed
}

// 十六町 のように漢数字と町が連結しているか
const isKanjiNumberFollewedByCho = (targetTownName: string) => {
  const xCho = targetTownName.match(/.町/g)
  if (!xCho) return false
  const kanjiNumbers = findKanjiNumbers(xCho[0])
  return kanjiNumbers.length > 0
}

export const getTownRegexPatterns = async (
  pref: SinglePrefecture,
  city: SingleCity,
  apiVersion: number,
) =>
  fetchFromCache<[SingleTown, string][]>(
    `${pref.code}-${city.code}`,
    async () => {
      const api = await getTowns(pref, city, apiVersion)
      const pre_towns = api.data
      const townSet = new Set(pre_towns.map((town) => machiAzaName(town)))
      const towns: (
        | SingleMachiAza
        | (SingleMachiAza & { originalTown: SingleMachiAza })
      )[] = []

      const isKyoto = city.city === '京都市'

      // 町丁目に「○○町」が含まれるケースへの対応
      // 通常は「○○町」のうち「町」の省略を許容し同義語として扱うが、まれに自治体内に「○○町」と「○○」が共存しているケースがある。
      // この場合は町の省略は許容せず、入力された住所は書き分けられているものとして正規化を行う。
      // 更に、「愛知県名古屋市瑞穂区十六町1丁目」漢数字を含むケースだと丁目や番地・号の正規化が不可能になる。このようなケースも除外。
      for (const town of pre_towns) {
        towns.push(town)

        const originalTown = machiAzaName(town)
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
            machiaza_id: town.machiaza_id,
            point: town.point,
            oaza_cho: townAbbr,
            originalTown: town,
          })
        }
      }

      // 少ない文字数の地名に対してミスマッチしないように文字の長さ順にソート
      towns.sort((a, b) => {
        let aLen = machiAzaName(a).length
        let bLen = machiAzaName(b).length

        // 大字で始まる場合、優先度を低く設定する。
        // 大字XX と XXYY が存在するケースもあるので、 XXYY を先にマッチしたい
        if (machiAzaName(a).startsWith('大字')) aLen -= 2
        if (machiAzaName(b).startsWith('大字')) bLen -= 2

        return bLen - aLen
      })

      const patterns: [SingleMachiAza, string][] = [];

      for (const town of towns) {
        {
          const pattern = toRegexPattern(
            machiAzaName(town)
              // 横棒を含む場合（流通センター、など）に対応
              .replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, '[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]')
              .replace(/大?字/g, '(大?字)?')
              // 以下住所マスターの町丁目に含まれる数字を正規表現に変換する
              // ABRデータには大文字の数字が含まれている（第１地割、など）ので、数字も一致するようにする
              .replace(
                /([壱一二三四五六七八九十]+|[１２３４５６７８９０]+)(丁目?|番(町|丁)|条|軒|線|(の|ノ)町|地割|号)/g,
                (match: string) => {
                  const patterns = []

                  patterns.push(
                    match
                      .toString()
                      .replace(
                        /(丁目?|番(町|丁)|条|軒|線|(の|ノ)町|地割|号)/,
                        '',
                      ),
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
                      .replace(/([１２３４５６７８９０]+)/g, (match) => {
                        return kanji2number(match).toString()
                      })
                      .replace(/(丁目?|番(町|丁)|条|軒|線|(の|ノ)町|地割|号)/, '')

                    patterns.push(num.toString()) // 半角アラビア数字
                  }

                  // 以下の正規表現は、上のよく似た正規表現とは違うことに注意！
                  const _pattern = `(${patterns.join(
                    '|',
                  )})((丁|町)目?|番(町|丁)|条|軒|線|の町?|地割|号|[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━])`
                  // if (city === '下閉伊郡普代村' && town.machiaza_id === '0022000') {
                  //   console.log(_pattern)
                  // }
                  return _pattern // デバッグのときにめんどくさいので変数に入れる。
                },
              ),
          )
          patterns.push(['originalTown' in town ? town.originalTown : town, pattern])
        }

        // X丁目の丁目なしの数字だけの場合で、数字以外が続いたり終端が現れる場合は確度が高いので、先にマッチさせる
        {
          const chomeMatch = machiAzaName(town).match(
            /([^一二三四五六七八九十]+)([一二三四五六七八九十]+)(丁目?)/,
          )
          if (!chomeMatch) {
            continue
          }
          const chomeNamePart = chomeMatch[1]
          const chomeNum = chomeMatch[2]
          const pattern = toRegexPattern(
            `^${chomeNamePart}${kan2num(chomeNum)}([-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]|(?![0-9])|$)`,
          )
          patterns.push([town, pattern])
        }
      }

      // X丁目の丁目なしの数字だけ許容するため、最後に数字だけ追加していく
      for (const town of towns) {
        const chomeMatch = machiAzaName(town).match(
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

      return patterns
    },
  )

export const getSameNamedPrefectureCityRegexPatterns = (
  prefApi: PrefectureApi,
) => {
  if (typeof cachedSameNamedPrefectureCityRegexPatterns !== 'undefined') {
    return cachedSameNamedPrefectureCityRegexPatterns
  }

  const prefList = prefApi.data
  const _prefs = prefList.map((pref) => {
    return pref.pref.replace(/[都|道|府|県]$/, '')
  })

  cachedSameNamedPrefectureCityRegexPatterns = []
  for (const pref of prefList) {
    for (const city of pref.cities) {
      const cityN = cityName(city)

      // 「福島県石川郡石川町」のように、市の名前が別の都道府県名から始まっているケースも考慮する。
      for (let j = 0; j < _prefs.length; j++) {
        if (cityN.indexOf(_prefs[j]) === 0) {
          cachedSameNamedPrefectureCityRegexPatterns.push([
            `${pref.pref}${cityN}`,
            `^${cityN}`,
          ])
        }
      }
    }
  }

  return cachedSameNamedPrefectureCityRegexPatterns
}
