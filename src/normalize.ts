import { number2kanji } from '@geolonia/japanese-numeral'
import { currentConfig, gh_pages_endpoint } from './config'
import { kan2num } from './lib/kan2num'
import { zen2han } from './lib/zen2han'
import { patchAddr } from './lib/patchAddr'
import {
  getPrefectures,
  getPrefectureRegexPatterns,
  getCityRegexPatterns,
  getTownRegexPatterns,
  getSameNamedPrefectureCityRegexPatterns,
  PrefectureList,
  TownList,
  AddrList,
  getRsdt,
  getChiban,
} from './lib/cacheRegexes'
import unfetch from 'isomorphic-unfetch'
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
} from './japanese-addresses-v2'

type TransformRequestResponse = null | PrefectureList | TownList | AddrList

export type TransformRequestQuery = {
  level: number //  level = -1 は旧 API。 transformRequestFunction を設定しても無視する
  pref?: string
  city?: string
  town?: string
}

export type TransformRequestFunction = (
  url: URL,
  query: TransformRequestQuery,
) => TransformRequestResponse | Promise<TransformRequestResponse>

/**
 * normalize {@link Normalizer} の動作オプション。
 */
export interface Config {
  /**
   * レスポンス型のバージョン。デフォルト 1
   * 1 の場合は jyukyo: string, gaiku: string
   * 2 の場合は addr: string,　other: string
   */
  interfaceVersion: number

  /** 住所データを URL 形式で指定。 file:// 形式で指定するとローカルファイルを参照できます。 */
  japaneseAddressesApi: string

  /** 町丁目のデータを何件までキャッシュするか。デフォルト 1,000 */
  townCacheSize: number

  /** 住所データへのリクエストを変形するオプション。 interfaceVersion === 2 で有効 */
  transformRequest?: TransformRequestFunction

  geoloniaApiKey?: string
}
export const config: Config = currentConfig

export type NormalizeResult = {
  /** 都道府県 */
  pref: string
  /** 市区町村 */
  city: string
  /** 町丁目 */
  town: string
  /** 住居表示または地番 */
  addr: string
  /** 正規化後の住所文字列 */
  other?: string
  /** 緯度 */
  lat?: number
  /** 経度 */
  lng?: number
  /**
   * 住所文字列をどこまで判別できたかを表す正規化レベル
   * - 0 - 都道府県も判別できなかった。
   * - 1 - 都道府県まで判別できた。
   * - 2 - 市区町村まで判別できた。
   * - 3 - 町丁目まで判別できた。
   * - 8 - 住居表示住所の街区符号・住居番号までの判別または地番住所の判別ができた。
   */
  level: number
}

/**
 * 正規化関数の {@link normalize} のオプション
 */
export interface Option {
  /**
   * 正規化を行うレベルを指定します。{@link Option.level}
   *
   * @see https://github.com/geolonia/normalize-japanese-addresses#normalizeaddress-string
   */
  level?: number

  /** 指定した場合、Geolonia のバックエンドを利用してより高精度の正規化を行います */
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

export type FetchOptions = {
  offset?: number
  length?: number
}

export type FetchLike = (
  input: string,
  options?: FetchOptions,
  requestQuery?: TransformRequestQuery,
) => Promise<
  Response | { json: () => Promise<unknown>; text: () => Promise<string> }
>

const defaultOption = {
  level: 8,
}

/**
 * @internal
 */
export const __internals: { fetch: FetchLike } = {
  // default fetch
  fetch: (input: string, options) => {
    const o = options || {}
    let url = new URL(`${config.japaneseAddressesApi}${input}`).toString()
    if (config.geoloniaApiKey) {
      url += `?geolonia-api-key=${config.geoloniaApiKey}`
    }
    const headers: HeadersInit = {}
    if (typeof o.length !== 'undefined' && typeof o.offset !== 'undefined') {
      headers['Range'] = `bytes=${o.offset}-${o.offset + o.length - 1}`
    }
    return unfetch(url, {
      headers,
    })
  },
}

const normalizeTownName = async (addr: string, pref: string, city: string) => {
  addr = addr.trim().replace(/^大字/, '')
  const townPatterns = await getTownRegexPatterns(pref, city)

  const regexPrefixes = ['^']
  if (city.match(/^京都市/)) {
    // 京都は通り名削除のために後方一致を使う
    regexPrefixes.push('.*')
  }

  for (const regexPrefix of regexPrefixes) {
    for (const [town, pattern] of townPatterns) {
      const regex = new RegExp(`${regexPrefix}${pattern}`)
      const match = addr.match(regex)
      if (match) {
        return {
          town,
          addr: addr.substring(match[0].length),
          lat: typeof town.point !== 'undefined' ? town.point[1] : undefined,
          lng: typeof town.point !== 'undefined' ? town.point[0] : undefined,
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
): Promise<NormalizedAddrPart> {
  const match = addr.match(
    /^([1-9][0-9]*)(?:-([1-9][0-9]*))?(?:-([1-9][0-9]*))?/,
  )
  if (!match) {
    return {
      rest: addr,
    }
  }
  const rest = addr.substring(match[0].length)
  // TODO: rsdtの場合はrsdtと地番を両方取得する
  if (town.rsdt) {
    const res = await getRsdt(pref, city, town)
    for (const rsdt of res) {
      if (match[0] === rsdtToString(rsdt)) {
        return {
          rsdt,
          rest,
        }
      }
    }
  } else {
    const res = await getChiban(pref, city, town)
    for (const chiban of res) {
      if (match[0] === chibanToString(chiban)) {
        return {
          chiban,
          rest,
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
  if (config.interfaceVersion < 3) {
    throw new Error(
      'この normalize-japanese-addresses のバージョンは interfaceVersion 3 未満を対応していません。APIエンドポイントとインタフェースバージョンをご確認ください。',
    )
  }

  if (option.geoloniaApiKey || config.geoloniaApiKey) {
    option.level = 8
    option.geoloniaApiKey && (config.geoloniaApiKey = option.geoloniaApiKey)
    // API キーがある場合は、 Geolonia SaaS に切り替え。
    // ただし、config を書き換えて別のエンドポイントを使うようにカスタマイズしているケースがあるので、その場合は config に既に入っている値を優先
    if (config.japaneseAddressesApi === gh_pages_endpoint) {
      config.japaneseAddressesApi =
        'https://japanese-addresses.geolonia.com/next/ja'
    }
  }

  /**
   * 入力された住所に対して以下の正規化を予め行う。
   *
   * 1. `1-2-3` や `四-五-六` のようなフォーマットのハイフンを半角に統一。
   * 2. 町丁目以前にあるスペースをすべて削除。
   * 3. 最初に出てくる `1-` や `五-` のような文字列を町丁目とみなして、それ以前のスペースをすべて削除する。
   */
  let addr = address
    .normalize('NFC')
    .replace(/　/g, ' ')
    .replace(/ +/g, ' ')
    .replace(/([０-９Ａ-Ｚａ-ｚ]+)/g, (match) => {
      // 全角のアラビア数字は問答無用で半角にする
      return zen2han(match)
    })
    // 数字の後または数字の前にくる横棒はハイフンに統一する
    .replace(
      /([0-9０-９一二三四五六七八九〇十百千][-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━])|([-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━])[0-9０-９一二三四五六七八九〇十]/g,
      (match) => {
        return match.replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, '-')
      },
    )
    .replace(/(.+)(丁目?|番(町|地|丁)|条|軒|線|(の|ノ)町|地割)/, (match) => {
      return match.replace(/ /g, '') // 町丁目名以前のスペースはすべて削除
    })
    .replace(/(.+)((郡.+(町|村))|((市|巿).+(区|區)))/, (match) => {
      return match.replace(/ /g, '') // 区、郡以前のスペースはすべて削除
    })
    .replace(/.+?[0-9一二三四五六七八九〇十百千]-/, (match) => {
      return match.replace(/ /g, '') // 1番はじめに出てくるアラビア数字以前のスペースを削除
    })

  let pref: SinglePrefecture | undefined
  let city: SingleCity | undefined
  let town: SingleMachiAza | undefined
  let lat: number | undefined
  let lng: number | undefined
  let level = 0
  let normalized = null

  // 都道府県名の正規化

  const prefectures = await getPrefectures()
  // const prefs = prefectures.map((pref) => pref.pref)
  const prefPatterns = getPrefectureRegexPatterns(prefectures)
  const sameNamedPrefectureCityRegexPatterns = getSameNamedPrefectureCityRegexPatterns(
    prefectures,
  )

  // 県名が省略されており、かつ市の名前がどこかの都道府県名と同じ場合(例.千葉県千葉市)、
  // あらかじめ県名を補完しておく。
  for (let i = 0; i < sameNamedPrefectureCityRegexPatterns.length; i++) {
    const [prefectureCity, reg] = sameNamedPrefectureCityRegexPatterns[i]
    const match = addr.match(reg)
    if (match) {
      addr = addr.replace(new RegExp(reg), prefectureCity)
      break
    }
  }

  for (let i = 0; i < prefPatterns.length; i++) {
    const [_pref, pattern] = prefPatterns[i]
    const match = addr.match(pattern)
    if (match) {
      pref = _pref
      addr = addr.substring(match[0].length) // 都道府県名以降の住所
      break
    }
  }

  if (!pref) {
    // 都道府県名が省略されている
    const matched = []
    for (const _pref of prefectures) {
      const cityPatterns = getCityRegexPatterns(_pref)

      addr = addr.trim()
      for (let i = 0; i < cityPatterns.length; i++) {
        const [_city, pattern] = cityPatterns[i]
        const match = addr.match(pattern)
        if (match) {
          matched.push({
            pref: _pref,
            city: _city,
            addr: addr.substring(match[0].length),
          })
        }
      }
    }

    // マッチする都道府県が複数ある場合は町名まで正規化して都道府県名を判別する。（例: 東京都府中市と広島県府中市など）
    if (1 === matched.length) {
      pref = matched[0].pref
    } else {
      for (let i = 0; i < matched.length; i++) {
        const m = matched[i]
        const normalized = await normalizeTownName(
          m.addr,
          prefectureName(m.pref),
          cityName(m.city),
        )
        if (normalized) {
          pref = m.pref
        }
      }
    }
  }

  if (pref && option.level >= 2) {
    const cityPatterns = getCityRegexPatterns(pref)

    addr = addr.trim()
    for (const [_city, pattern] of cityPatterns) {
      const match = addr.match(pattern)
      if (match) {
        city = _city
        addr = addr.substring(match[0].length) // 市区町村名以降の住所
        break
      }
    }
  }

  // 町丁目以降の正規化
  if (pref && city && option.level >= 3) {
    normalized = await normalizeTownName(
      addr,
      prefectureName(pref),
      cityName(city),
    )
    if (normalized) {
      town = normalized.town
      addr = normalized.addr
      lat = normalized.lat
      lng = normalized.lng
    }

    // townが取得できた場合にのみ、addrに対する各種の変換処理を行う。
    if (town) {
      addr = addr
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

  addr = patchAddr(
    pref ? prefectureName(pref) : '',
    city ? cityName(city) : '',
    town ? machiAzaName(town) : '',
    addr,
  )

  if (pref) level = level + 1
  if (city) level = level + 1
  if (town) level = level + 1

  if (option.level <= 3 || level < 3) {
    const result = {
      pref: pref ? prefectureName(pref) : '',
      city: city ? cityName(city) : '',
      town: town ? machiAzaName(town) : '',
      addr,
      level,
      lat,
      lng,
    }
    return result
  }

  const normalizedAddrPart = await normalizeAddrPart(
    addr,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    pref!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    city!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    town!,
  )
  let other = undefined
  // TODO: rsdtと地番を両方対応した時に両方返すけど、今はrsdtを優先する
  if (normalizedAddrPart.rsdt) {
    addr = rsdtToString(normalizedAddrPart.rsdt)
    other = normalizedAddrPart.rest
    if (normalizedAddrPart.rsdt.point) {
      lat = normalizedAddrPart.rsdt.point[1]
      lng = normalizedAddrPart.rsdt.point[0]
    }
    level = 8
  } else if (normalizedAddrPart.chiban) {
    addr = chibanToString(normalizedAddrPart.chiban)
    other = normalizedAddrPart.rest
    if (normalizedAddrPart.chiban.point) {
      lat = normalizedAddrPart.chiban.point[1]
      lng = normalizedAddrPart.chiban.point[0]
    }
    level = 8
  }
  const result: NormalizeResult = {
    pref: pref ? prefectureName(pref) : '',
    city: city ? cityName(city) : '',
    town: town ? machiAzaName(town) : '',
    addr,
    level,
    lat,
    lng,
  }
  if (other) {
    result.other = other
  }
  return result
}
