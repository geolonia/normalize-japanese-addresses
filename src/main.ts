import {
  number2kanji,
} from '@geolonia/japanese-numeral'

import { kan2num } from './lib/kan2num'
import { zen2han } from './lib/zen2han'
import { getPrefectures, getPrefectureRegexes, getCityRegexes, getTownRegexes } from './lib/cacheRegexes'

export interface NormalizeResult {
  pref: string
  city: string
  town: string
  addr: string
  level: number
}

export interface Option {
  level: number
}

const defaultOption: Option = {
  level: 3,
}

const normalizeTownName = async (addr: string, pref: string, city: string) => {
  addr = addr.trim().replace(/^大字/, '')

  const townRegexes = await getTownRegexes(pref, city)

  for (let i = 0; i < townRegexes.length; i++) {
    const [_town, reg] = townRegexes[i]
    const match = addr.match(reg)

    if (match) {
      return {town: _town, addr: addr.substr(match[0].length)}
    }
  }
}

export const normalize: (
  input: string,
  option?: Option,
) => Promise<NormalizeResult> = async (address, option = defaultOption) => {
  /**
   * 入力された住所に対して以下の正規化を予め行う。
   *
   * 1. `1-2-3` や `四-五-六` のようなフォーマットのハイフンを半角に統一。
   * 2. 町丁目以前にあるスペースをすべて削除。
   * 3. 最初に出てくる `1-` や `五-` のような文字列を町丁目とみなして、それ以前のスペースをすべて削除する。
   */
  let addr = address
    .replace(/　/g, ' ')
    .replace(/ +/g, ' ')
    .replace(/([０-９Ａ-Ｚａ-ｚ]+)/g, (match) => {
      // 全角のアラビア数字は問答無用で半角にする
      return zen2han(match)
    })
    .replace(
      /([0-9０-９一二三四五六七八九〇十百千][-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━])|([-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━])[0-9０-９一二三四五六七八九〇十]/g,
      (match) => {
        return match.replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, '-')
      },
    )
    .replace(/(.+)(丁目?|番(町|地|丁)|条|軒|線|(の|ノ)町|地割)/, (match) => {
      return match.replace(/ /g, '') // 町丁目名以前のスペースはすべて削除
    })
    .replace(/.+?[0-9一二三四五六七八九〇十百千]-/, (match) => {
      return match.replace(/ /g, '') // 1番はじめに出てくるアラビア数字以前のスペースを削除
    })

  let pref = ''
  let city = ''
  let town = ''
  let level = 0

  // 都道府県名の正規化

  const responsePrefs = await getPrefectures()
  const prefectures = responsePrefs.data as { [key: string]: string[] }
  const prefs = Object.keys(prefectures)
  const prefRegexes = await getPrefectureRegexes(prefs)

  for (let i = 0; i < prefRegexes.length; i++) {
    const [_pref, reg] = prefRegexes[i]
    if (addr.match(reg)) {
      pref = _pref
      addr = addr.substring(pref.length) // 都道府県名以降の住所
      break
    }
  }

  if (!pref) { // 都道府県名が省略されている
    const matched = []
    for (const _pref in prefectures) {
      const cities = prefectures[_pref]
      const cityRegexes = getCityRegexes(_pref, cities)

      addr = addr.trim()
      for (let i = 0; i < cityRegexes.length; i++) {
        const [_city, regex] = cityRegexes[i]
        const match = addr.match(regex)
        if (match) {
          matched.push({
            pref: _pref,
            city: _city,
            addr: addr.substring(match[0].length)
          })
        }
      }
    }

    // マッチする都道府県が複数ある場合は町名まで正規化して都道府県名を判別する。（例: 東京都府中市と広島県府中市など）
    if (1 === matched.length) {
      pref = matched[0].pref
    } else {
      for (let i = 0; i < matched.length; i++) {
        const normalized = await normalizeTownName(matched[i].addr, matched[i].pref, matched[i].city)
        if (normalized) {
          pref = matched[i].pref
        }
      }
    }
  }

  if (pref && option.level >= 2) {
    const cities = prefectures[pref]
    const cityRegexes = getCityRegexes(pref, cities)

    addr = addr.trim()
    for (let i = 0; i < cityRegexes.length; i++) {
      const [_city, regex] = cityRegexes[i]
      const match = addr.match(regex)
      if (match) {
        city = _city
        addr = addr.substring(match[0].length) // 市区町村名以降の住所
        break
      }
    }
  }

  // 町丁目以降の正規化'
  if (city && option.level >= 3) {
    const normalized = await normalizeTownName(addr, pref, city)
    if (normalized) {
      town = normalized.town
      addr = normalized.addr
    }

    addr = addr
      .replace(/^-/, '')
      .replace(/([0-9]+)(丁目)/g, (match) => {
        return match.replace(/([0-9]+)/g, (num) => {
          return number2kanji(Number(num))
        })
      })
      .replace(
        /([0-9〇一二三四五六七八九十百千]+)(番|番地)([(0-9〇一二三四五六七八九十百千]+)号?/,
        '$1-$3',
      )
      .replace(/([0-9〇一二三四五六七八九十百千]+)番地?/, '$1')
      .replace(/([0-9〇一二三四五六七八九十百千]+)の/g, '$1-')
      .replace(
        /([0-9〇一二三四五六七八九十百千]+)[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g,
        (match) => {
          return kan2num(match).replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, '-')
        },
      )
      .replace(
        /[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]([0-9〇一二三四五六七八九十百千]+)/g,
        (match) => {
          return kan2num(match).replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, '-')
        },
      )
      .replace(/([0-9〇一二三四五六七八九十百千]+)-/, (s) => {
        // `1-` のようなケース
        return kan2num(s)
      })
      .replace(/-([0-9〇一二三四五六七八九十百千]+)/, (s) => {
        // `-1` のようなケース
        return kan2num(s)
      })
      .replace(/-[^0-9]+([0-9〇一二三四五六七八九十百千]+)/, (s) => {
        // `-あ1` のようなケース
        return kan2num(zen2han(s))
      })
      .replace(/([0-9〇一二三四五六七八九十百千]+)$/, (s) => {
        // `串本町串本１２３４` のようなケース
        return kan2num(s)
      })
      .trim()
  }

  if (pref) level = level + 1
  if (city) level = level + 1
  if (town) level = level + 1

  return {
    pref,
    city,
    town,
    addr,
    level,
  }
}
