import { number2kanji } from '@geolonia/japanese-numeral'
import { currentConfig } from './config'
import { kan2num } from './lib/kan2num'
import { zen2han } from './lib/zen2han'
import { patchAddr } from './lib/patchAddr'
import {
  getPrefectures,
  getPrefectureRegexPatterns,
  getCityRegexPatterns,
  getTownRegexPatterns,
  getSameNamedPrefectureCityRegexPatterns,
  getRsdt,
  getChiban,
} from './lib/cacheRegexes'
import {
  chibanToString,
  cityName,
  machiAzaName,
  prefectureName,
  rsdtToString,
  SingleChiban,
  SingleCity,
  SingleMachiAza,
  SinglePrefecture,
  SingleRsdt,
} from '@geolonia/japanese-addresses-v2'
import { prenormalize } from './lib/normalizeHelpers'
import {
  cityToResultPoint,
  machiAzaToResultPoint,
  NormalizeResult,
  NormalizeResultPoint,
  prefectureToResultPoint,
  rsdtOrChibanToResultPoint,
  upgradePoint,
} from './types'
import {
  removeCitiesFromPrefecture,
  removeExtraFromMachiAza,
} from './lib/utils'

export type TransformRequestQuery = {
  level: number //  level = -1 は旧 API。 transformRequestFunction を設定しても無視する
  pref?: string
  city?: string
  town?: string
}

const __VERSION__: string = 'dev'
export const version = __VERSION__

/**
 * normalize {@link Normalizer} の動作オプション。
 */
export interface Config {
  /** 住所データを URL 形式で指定。 file:// 形式で指定するとローカルファイルを参照できます。 */
  japaneseAddressesApi: string

  /** 内部キャッシュの最大サイズ。デフォルトでは 1,000 件 */
  cacheSize: number

  geoloniaApiKey?: string
}
export const config: Config = currentConfig

/**
 * 正規化関数の {@link normalize} のオプション
 */
export interface Option {
  /**
   * 希望最大正規化を行うレベルを指定します。{@link Option.level}
   *
   * @see https://github.com/geolonia/normalize-japanese-addresses#normalizeaddress-string
   */
  level?: number

  geoloniaApiKey?: string
}

/**
 * 住所を正規化します。
 *
 * @param input - 住所文字列
 * @param option -  正規化のオプション {@link Option}
 *
 * @returns 正規化結果のオブジェクト {@link NormalizeResult}
 *
 * @see https://github.com/geolonia/normalize-japanese-addresses#normalizeaddress-string
 */
export type Normalizer = (
  input: string,
  option?: Option,
) => Promise<NormalizeResult>

const defaultOption = {
  level: 8,
}

const normalizeTownName = async (
  input: string,
  pref: SinglePrefecture,
  city: SingleCity,
  apiVersion: number,
) => {
  input = input.trim().replace(/^大字/, '')
  const townPatterns = await getTownRegexPatterns(pref, city, apiVersion)

  const regexPrefixes = ['^']
  if (city.city === '京都市') {
    // 京都は通り名削除のために後方一致を使う
    regexPrefixes.push('.*')
  }

  for (const regexPrefix of regexPrefixes) {
    for (const [town, pattern] of townPatterns) {
      const regex = new RegExp(`${regexPrefix}${pattern}`)
      const match = input.match(regex)
      if (match) {
        return {
          town,
          other: input.substring(match[0].length),
        }
      }
    }
  }
}

type NormalizedAddrPart = {
  chiban?: SingleChiban
  rsdt?: SingleRsdt
  rest: string
}
async function normalizeAddrPart(
  addr: string,
  pref: SinglePrefecture,
  city: SingleCity,
  town: SingleMachiAza,
  apiVersion: number,
): Promise<NormalizedAddrPart> {
  const match = addr.match(
    /^([1-9][0-9]*)(?:-([1-9][0-9]*))?(?:-([1-9][0-9]*))?/,
  )
  if (!match) {
    return {
      rest: addr,
    }
  }
  // TODO: rsdtの場合はrsdtと地番を両方取得する
  if (town.rsdt) {
    const res = await getRsdt(pref, city, town, apiVersion)
    for (const rsdt of res) {
      const addrPart = rsdtToString(rsdt)
      if (match[0] === addrPart) {
        return {
          rsdt,
          rest: addr.substring(addrPart.length),
        }
      }
    }
  } else {
    const res = await getChiban(pref, city, town, apiVersion)
    for (const chiban of res) {
      const addrPart = chibanToString(chiban)
      if (match[0] === addrPart) {
        return {
          chiban,
          rest: addr.substring(addrPart.length),
        }
      }
    }
  }
  return {
    rest: addr,
  }
}

export const normalize: Normalizer = async (
  address,
  _option = defaultOption,
) => {
  const option = { ...defaultOption, ..._option }

  option.geoloniaApiKey ??= config.geoloniaApiKey

  // other に入っている文字列は正規化するときに
  let other = prenormalize(address)

  let pref: SinglePrefecture | undefined
  let city: SingleCity | undefined
  let town: SingleMachiAza | undefined
  let point: NormalizeResultPoint | undefined
  let addr: string | undefined
  let level = 0

  // 都道府県名の正規化

  const prefectures = await getPrefectures()
  const apiVersion = prefectures.meta.updated
  const prefPatterns = getPrefectureRegexPatterns(prefectures)
  const sameNamedPrefectureCityRegexPatterns =
    getSameNamedPrefectureCityRegexPatterns(prefectures)

  // 県名が省略されており、かつ市の名前がどこかの都道府県名と同じ場合(例.千葉県千葉市)、
  // あらかじめ県名を補完しておく。
  for (const [prefectureCity, reg] of sameNamedPrefectureCityRegexPatterns) {
    const match = other.match(reg)
    if (match) {
      other = other.replace(new RegExp(reg), prefectureCity)
      break
    }
  }

  for (const [_pref, pattern] of prefPatterns) {
    const match = other.match(pattern)
    if (match) {
      pref = _pref
      other = other.substring(match[0].length) // 都道府県名以降の住所
      point = prefectureToResultPoint(pref)
      break
    }
  }

  if (!pref) {
    // 都道府県名が省略されている
    const matched: {
      pref: SinglePrefecture
      city: SingleCity
      other: string
    }[] = []
    for (const _pref of prefectures.data) {
      const cityPatterns = getCityRegexPatterns(_pref)

      other = other.trim()
      for (const [_city, pattern] of cityPatterns) {
        const match = other.match(pattern)
        if (match) {
          matched.push({
            pref: _pref,
            city: _city,
            other: other.substring(match[0].length),
          })
        }
      }
    }

    // マッチする都道府県が複数ある場合は町名まで正規化して都道府県名を判別する。（例: 東京都府中市と広島県府中市など）
    if (1 === matched.length) {
      pref = matched[0].pref
    } else {
      for (const m of matched) {
        const normalized = await normalizeTownName(
          m.other,
          m.pref,
          m.city,
          apiVersion,
        )
        if (normalized) {
          pref = m.pref
          city = m.city
          town = normalized.town
          other = normalized.other
          point = upgradePoint(point, machiAzaToResultPoint(town))
        }
      }
    }
  }

  if (pref && option.level >= 2) {
    const cityPatterns = getCityRegexPatterns(pref)

    other = other.trim()
    for (const [_city, pattern] of cityPatterns) {
      const match = other.match(pattern)
      if (match) {
        city = _city
        point = upgradePoint(point, cityToResultPoint(city))
        other = other.substring(match[0].length) // 市区町村名以降の住所
        break
      }
    }
  }

  // 町丁目以降の正規化
  if (pref && city && option.level >= 3) {
    const normalized = await normalizeTownName(other, pref, city, apiVersion)
    if (normalized) {
      town = normalized.town
      other = normalized.other
      point = upgradePoint(point, machiAzaToResultPoint(town))
    }

    // townが取得できた場合にのみ、addrに対する各種の変換処理を行う。
    if (town) {
      other = other
        .replace(/^-/, '')
        .replace(/([0-9]+)(丁目)/g, (match) => {
          return match.replace(/([0-9]+)/g, (num) => {
            return number2kanji(Number(num))
          })
        })
        .replace(
          /(([0-9]+|[〇一二三四五六七八九十百千]+)(番地?)([0-9]+|[〇一二三四五六七八九十百千]+)号)\s*(.+)/,
          '$1 $5',
        )
        .replace(
          /([0-9]+|[〇一二三四五六七八九十百千]+)\s*(番地?)\s*([0-9]+|[〇一二三四五六七八九十百千]+)\s*号?/,
          '$1-$3',
        )
        .replace(/([0-9]+|[〇一二三四五六七八九十百千]+)番(地|$)/, '$1')
        .replace(/([0-9]+|[〇一二三四五六七八九十百千]+)の/g, '$1-')
        .replace(
          /([0-9]+|[〇一二三四五六七八九十百千]+)[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g,
          (match) => {
            return kan2num(match).replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, '-')
          },
        )
        .replace(
          /[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]([0-9]+|[〇一二三四五六七八九十百千]+)/g,
          (match) => {
            return kan2num(match).replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, '-')
          },
        )
        .replace(/([0-9]+|[〇一二三四五六七八九十百千]+)-/, (s) => {
          // `1-` のようなケース
          return kan2num(s)
        })
        .replace(/-([0-9]+|[〇一二三四五六七八九十百千]+)/, (s) => {
          // `-1` のようなケース
          return kan2num(s)
        })
        .replace(/-[^0-9]([0-9]+|[〇一二三四五六七八九十百千]+)/, (s) => {
          // `-あ1` のようなケース
          return kan2num(zen2han(s))
        })
        .replace(/([0-9]+|[〇一二三四五六七八九十百千]+)$/, (s) => {
          // `串本町串本１２３４` のようなケース
          return kan2num(s)
        })
        .trim()
    }
  }

  other = patchAddr(
    pref ? prefectureName(pref) : '',
    city ? cityName(city) : '',
    town ? machiAzaName(town) : '',
    other,
  )

  if (pref) level = level + 1
  if (city) level = level + 1
  if (town) level = level + 1

  if (option.level <= 3 || level < 3) {
    const result: NormalizeResult = {
      pref: pref ? prefectureName(pref) : undefined,
      city: city ? cityName(city) : undefined,
      town: town ? machiAzaName(town) : undefined,
      other: other,
      level,
      point,
      metadata: {
        input: address,
        prefecture: removeCitiesFromPrefecture(pref),
        city: city,
        machiAza: removeExtraFromMachiAza(town),
      },
    }
    return result
  }

  const normalizedAddrPart = await normalizeAddrPart(
    other,
    pref!,
    city!,
    town!,
    apiVersion,
  )
  // TODO: rsdtと地番を両方対応した時に両方返すけど、今はrsdtを優先する
  if (normalizedAddrPart.rsdt) {
    addr = rsdtToString(normalizedAddrPart.rsdt)
    other = normalizedAddrPart.rest
    point = upgradePoint(
      point,
      rsdtOrChibanToResultPoint(normalizedAddrPart.rsdt),
    )
    level = 8
  } else if (normalizedAddrPart.chiban) {
    addr = chibanToString(normalizedAddrPart.chiban)
    other = normalizedAddrPart.rest
    point = upgradePoint(
      point,
      rsdtOrChibanToResultPoint(normalizedAddrPart.chiban),
    )
    level = 8
  }
  const result: NormalizeResult = {
    pref: pref ? prefectureName(pref) : undefined,
    city: city ? cityName(city) : undefined,
    town: town ? machiAzaName(town) : undefined,
    addr,
    level,
    point,
    other,
    metadata: {
      input: address,
      prefecture: removeCitiesFromPrefecture(pref),
      city: city,
      machiAza: removeExtraFromMachiAza(town),
      rsdt: normalizedAddrPart.rsdt,
      chiban: normalizedAddrPart.chiban,
    },
  }
  return result
}
