import os from 'os'
import path from 'path'
import {
  kanji2number,
  number2kanji,
  findKanjiNumbers,
} from '@geolonia/japanese-numeral'

const today = new Date().toISOString().slice(0, 10)
const tmpdir = path.join(os.tmpdir(), `normalize-japanese-addresses-${today}`)

const fetch = require('node-fetch-cache')(tmpdir)
import { toRegex } from './lib/dict'

const endpoint = 'https://geolonia.github.io/japanese-addresses/api/ja'

const kan2num = (string: string) => {
  const kanjiNumbers = findKanjiNumbers(string)
  for (let i = 0; i < kanjiNumbers.length; i++) {
    // @ts-ignore
    string = string.replace(kanjiNumbers[i], kanji2number(kanjiNumbers[i]))
  }

  return string
}

const zen2han = (str: string) => {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９ー−]/g, (s) => {
    if ('ー' === s || '−' === s) {
      return '-'
    } else {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0)
    }
  })
}

let cachedPrefectureRegexes: [string, RegExp][] | undefined = undefined
const getPrefectureRegexes = (prefs: string[]) => {
  if (cachedPrefectureRegexes) {
    return cachedPrefectureRegexes
  }

  cachedPrefectureRegexes = prefs.map((pref) => {
    const _pref = pref.replace(/(都|道|府|県)$/, '') // `東京` の様に末尾の `都府県` が抜けた住所に対応
    const reg = new RegExp(`^${_pref}(都|道|府|県)`)
    return [pref, reg]
  })

  return cachedPrefectureRegexes
}

const cachedCityRegexes: { [key: string]: [string, RegExp][] } = {}
const getCityRegexes = (pref: string, cities: string[]) => {
  const cachedResult = cachedCityRegexes[pref]
  if (typeof cachedResult !== 'undefined') {
    return cachedResult
  }

  // 少ない文字数の地名に対してミスマッチしないように文字の長さ順にソート
  cities.sort((a: string, b: string) => {
    return b.length - a.length
  })

  const regexes = cities.map((city) => {
    let regex
    if (city.match(/(町|村)$/)) {
      regex = new RegExp(`^${toRegex(city).replace(/(.+?)郡/, '($1郡)?')}`) // 郡が省略されてるかも
    } else {
      regex = new RegExp(`^${toRegex(city)}`)
    }
    return [city, regex] as [string, RegExp]
  })

  cachedCityRegexes[pref] = regexes
  return regexes
}

const cachedTownRegexes: { [key: string]: [string, RegExp][] } = {}
const getTownRegexes = async (pref: string, city: string) => {
  const cachedResult = cachedTownRegexes[`${pref}-${city}`]
  if (typeof cachedResult !== 'undefined') {
    return cachedResult
  }

  const responseTowns = await fetch(
    `${endpoint}/${encodeURI(pref)}/${encodeURI(city)}.json`,
  )
  const towns = (await responseTowns.json()) as string[]

  // 少ない文字数の地名に対してミスマッチしないように文字の長さ順にソート
  towns.sort((a, b) => {
    return b.length - a.length
  })

  const regexes = towns.map((town) => {
    const regex = toRegex(
      town
        .replace(/大?字/g, '(大?字)?')
        // 以下住所マスターの町丁目に含まれる数字を正規表現に変換する
        .replace(
          /([壱一二三四五六七八九十]+)(丁目?|番(町|丁)|条|軒|線|(の|ノ)町|地割)/g,
          (match: string) => {
            const regexes = []

            regexes.push(
              match
                .toString()
                .replace(/(丁目?|番(町|丁)|条|軒|線|(の|ノ)町|地割)/, ''),
            ) // 漢数字

            if (match.match(/^壱/)) {
              regexes.push('一')
              regexes.push('1')
              regexes.push('１')
            } else {
              const num = match
                .replace(/([一二三四五六七八九十]+)/g, (match) => {
                  return kan2num(match)
                })
                .replace(/(丁目?|番(町|丁)|条|軒|線|(の|ノ)町|地割)/, '')

              regexes.push(num.toString()) // 半角アラビア数字
              regexes.push(
                String.fromCharCode(num.toString().charCodeAt(0) + 0xfee0),
              ) // 全角アラビア数字
            }

            // 以下の正規表現は、上のよく似た正規表現とは違うことに注意！
            return `(${regexes.join(
              '|',
            )})((丁|町)目?|番(町|丁)|条|軒|線|の町?|地割|[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━])`
          },
        ),
    )

    if (city.match(/^京都市/)) {
      return [town.replace(/^大字/, ''), new RegExp(`.*${regex}`)]
    } else {
      return [town.replace(/^大字/, ''), new RegExp(`^${regex}`)]
    }
  }) as [string, RegExp][]

  cachedTownRegexes[`${pref}-${city}`] = regexes
  return regexes
}

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
    .replace(
      /([0-9０-９一二三四五六七八九〇十百千][-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━])|([-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━])[0-9０-９一二三四五六七八九〇十]/g,
      (match) => {
        return zen2han(match).replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, '-')
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

  const responsePrefs = await fetch(`${endpoint}.json`)
  const prefectures = await responsePrefs.json()
  const prefs = Object.keys(prefectures)

  const prefRegexes = getPrefectureRegexes(prefs)
  for (let i = 0; i < prefRegexes.length; i++) {
    const [_pref, reg] = prefRegexes[i]
    if (addr.match(reg)) {
      pref = _pref
      addr = addr.substring(pref.length) // 都道府県名以降の住所
      break
    }
  }

  // 市区町村名の正規化
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
    addr = addr.trim().replace(/^大字/, '')

    const townRegexes = await getTownRegexes(pref, city)

    for (let i = 0; i < townRegexes.length; i++) {
      const [_town, reg] = townRegexes[i]
      const match = addr.match(reg)
      if (match) {
        town = _town
        addr = addr.substr(match[0].length)
        break
      }
    }

    addr = addr
      .replace(/^-/, '')
      .replace(/([０-９Ａ-Ｚａ-ｚ]+)/g, (match) => {
        // 全角のアラビア数字は問答無用で半角にする
        return zen2han(match)
      })
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
          return kan2num(match).replace(
            /[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g,
            '-',
          )
        },
      )
      .replace(
        /[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]([0-9〇一二三四五六七八九十百千]+)/g,
        (match) => {
          return kan2num(match).replace(
            /[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g,
            '-',
          )
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
