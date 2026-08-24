import { number2kanji } from '@geolonia/japanese-numeral'
import { dictionary } from './lib/dictionaries/dictionary'
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

// ---- Trie-based fast path for town matching ----

// Character normalization map: maps variant characters to a single canonical form
// so both town names and input addresses normalize identically.
const _nm = new Map<string, string>()

// Old↔new kanji pairs from the dictionary (e.g. 亞→亜)
for (const e of dictionary) {
  _nm.set(e.src, e.dst)
}

// Variant character groups from toRegexPattern
for (const grp of [
  ['の', '之', 'ノ'],
  ['ヶ', 'ケ', 'が'],
  ['ヵ', 'カ', 'か', '力'],
  ['ッ', 'ツ', 'っ', 'つ'],
  ['え', 'エ', 'ヱ'],
  ['釜', '竈'],
  ['条', '條'],
  ['狛', '拍'],
  ['薮', '藪'],
  ['淵', '渕'],
  ['曽', '曾'],
  ['船', '舟'],
  ['菟', '莵'],
  ['崎', '﨑'],
  ['宜', '冝'],
]) {
  const canonical = grp[0]
  for (let i = 1; i < grp.length; i++) {
    _nm.set(grp[i], canonical)
  }
}

// Full-width digits → half-width
for (let i = 0; i <= 9; i++) {
  _nm.set(String.fromCharCode(0xff10 + i), String(i))
}

// Kanji single digits → arabic (一→1, etc.)
// Also map ニ(katakana) and ハ(katakana) to match their kanji numeral equivalents
for (const [k, a] of [
  ['〇', '0'], ['一', '1'], ['二', '2'], ['三', '3'], ['四', '4'],
  ['五', '5'], ['六', '6'], ['七', '7'], ['八', '8'], ['九', '9'],
  ['ニ', '2'], ['ハ', '8'],
]) {
  _nm.set(k, a)
}

// Hyphen variants → '-'
for (const h of '－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━') {
  _nm.set(h, '-')
}

function _nc(ch: string): string {
  return _nm.get(ch) ?? ch
}

function _ns(s: string): string {
  let r = ''
  for (const ch of s) r += _nc(ch)
  return r
}

// Trie node
interface _TN { c: Map<string, _TN>; t?: SingleMachiAza }

const _trieCache = new Map<string, _TN>()

function _trieInsert(root: _TN, key: string, town: SingleMachiAza) {
  let node = root
  for (const ch of key) {
    let child = node.c.get(ch)
    if (!child) { child = { c: new Map() }; node.c.set(ch, child) }
    node = child
  }
  if (!node.t) node.t = town
}

function _trieLookup(root: _TN, input: string): { town: SingleMachiAza; len: number } | null {
  let node = root
  let best: { town: SingleMachiAza; len: number } | null = null
  let i = 0
  for (const ch of input) {
    const next = node.c.get(_nc(ch))
    if (!next) break
    node = next
    i++
    if (node.t) best = { town: node.t, len: i }
  }
  return best
}

// Special alternation mappings from toRegexPattern: input form → canonical form
// e.g. "三栄町" in an address is actually "四谷三栄町"
const _altMap: [RegExp, string][] = [
  [/^三栄町/, '四谷三栄町'],
  [/^くじ野川/, '鬮野川'],
  [/^くじの川/, '鬮野川'],
  [/^柿さき町/, '柿碕町'],
  [/^とおり/, '通り'],
  [/^ふ頭/, '埠頭'],
  [/^番丁/, '番町'],
  [/^さい/, '穝'],
  [/^えぶり/, '杁'],
  [/^ひえ/, '薭'],
  [/^ヒエ/, '薭'],
]

function _buildTrie(townPatterns: [SingleMachiAza, string][]): _TN {
  const root: _TN = { c: new Map() }
  for (const [town] of townPatterns) {
    const name = machiAzaName(town)
    _trieInsert(root, _ns(name), town)
    // Handle optional 大字/字 prefix
    if (name.startsWith('大字')) _trieInsert(root, _ns(name.slice(2)), town)
    if (name.startsWith('字')) _trieInsert(root, _ns(name.slice(1)), town)
    // Handle special alternation forms (e.g. 四谷三栄町 also matches as 三栄町)
    for (const [re, canonical] of _altMap) {
      if (re.test(name)) {
        const altName = name.replace(re, canonical)
        _trieInsert(root, _ns(altName), town)
      }
      // Also check if this town IS the canonical, add alt form
      if (name.startsWith(canonical)) {
        const altForm = re.source.replace(/^\^/, '')
        const altName = name.replace(canonical, altForm)
        _trieInsert(root, _ns(altName), town)
      }
    }
  }
  return root
}

const normalizeTownName = async (
  input: string,
  pref: SinglePrefecture,
  city: SingleCity,
  apiVersion: number,
) => {
  input = input.trim().replace(/^大字/, '')
  const townPatterns = await getTownRegexPatterns(pref, city, apiVersion)

  // Fast path: trie lookup
  const trieKey = `${pref.code}-${city.code}`
  let trie = _trieCache.get(trieKey)
  if (!trie) {
    trie = _buildTrie(townPatterns)
    _trieCache.set(trieKey, trie)
  }
  const trieResult = _trieLookup(trie, input)
  if (trieResult) {
    return { town: trieResult.town, other: input.substring(trieResult.len) }
  }

  // Slow path: regex fallback (京都 .*-prefix, complex suffix patterns, etc.)
  const regexPrefixes = ['^']
  if (city.city === '京都市') {
    regexPrefixes.push('.*')
  }
  for (const regexPrefix of regexPrefixes) {
    for (const [town, pattern] of townPatterns) {
      const regex = new RegExp(`${regexPrefix}${pattern}`)
      const match = input.match(regex)
      if (match) {
        return { town, other: input.substring(match[0].length) }
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
      other = other.replace(reg, prefectureCity)
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
