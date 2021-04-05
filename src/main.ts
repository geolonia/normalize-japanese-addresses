import os from 'os'
import path from 'path'
import {
  kanji2number,
  number2kanji,
  findKanjiNumbers,
} from '@geolonia/japanese-numeral'

const numformat = (number: number) => {
  return ('0' + number).slice(-2)
}

const today = new Date()
const tmpdir = path.join(
  os.tmpdir(),
  `normalize-japanese-addresses-${today.getFullYear()}${numformat(
    today.getMonth() + 1,
  )}${numformat(today.getDate())}`,
)
const fetch = require('node-fetch-cache')(tmpdir)
import { toRegex } from './lib/dict'
import NormalizationError from './lib/NormalizationError'

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

export interface NormalizeResult {
  pref: string
  city: string
  town: string
  addr: string
}

export const normalize: (input: string) => Promise<NormalizeResult> = async (
  address,
) => {
  let addr = address

  // 都道府県名の正規化

  const responsePrefs = await fetch(`${endpoint}.json`)
  const prefectures = await responsePrefs.json()
  const prefs = Object.keys(prefectures)

  let pref = '' // 都道府県名
  addr = addr.trim()
  for (let i = 0; i < prefs.length; i++) {
    const _pref = prefs[i].replace(/(都|道|府|県)$/, '') // `東京` の様に末尾の `都府県` が抜けた住所に対応
    const reg = new RegExp(`^${_pref}(都|道|府|県)`)
    if (addr.match(reg)) {
      pref = prefs[i]
      addr = addr.substring(pref.length) // 都道府県名以降の住所
      break
    }
  }

  if (!pref) {
    throw new NormalizationError("Can't detect the prefecture.", address)
  }

  // 市区町村名の正規化

  const cities = prefectures[pref]

  // 少ない文字数の地名に対してミスマッチしないように文字の長さ順にソート
  cities.sort((a: string, b: string) => {
    return b.length - a.length
  })

  let city = '' // 市区町村名
  addr = addr.trim()
  for (let i = 0; i < cities.length; i++) {
    let regex
    if (cities[i].match(/(町|村)$/)) {
      regex = new RegExp(`^${toRegex(cities[i]).replace(/(.+?)郡/, '($1郡)?')}`) // 郡が省略されてるかも
    } else {
      regex = new RegExp(`^${toRegex(cities[i])}`)
    }
    const match = addr.match(regex)
    if (match) {
      city = cities[i]
      addr = addr.substring(match[0].length) // 市区町村名以降の住所
      break
    }
  }

  if (!city) {
    throw new NormalizationError("Can't detect the city.", address)
  }

  // 町丁目以降の正規化

  const responseTowns = await fetch(
    `${endpoint}/${encodeURI(pref)}/${encodeURI(city)}.json`,
  )
  const towns = await responseTowns.json()

  // 少ない文字数の地名に対してミスマッチしないように文字の長さ順にソート
  towns.sort((a: string, b: string) => {
    return b.length - a.length
  })

  let town = ''

  // `1丁目` 等の文字列を `一丁目` に変換
  addr = addr.trim().replace(/^大字/, '')

  for (let i = 0; i < towns.length; i++) {
    const regex = toRegex(
      towns[i]
        .replace(/大?字/g, '(大?字)?')
        // 以下住所マスターの町丁目に含まれる数字を正規表現に変換する
        .replace(
          /([壱一二三四五六七八九十]+)(丁目?|番町|条|軒|線|(の|ノ)町|地割)/g,
          (match: string) => {
            const regexes = []

            regexes.push(
              match
                .toString()
                .replace(/(丁目?|番町|条|軒|線|(の|ノ)町|地割)/, ''),
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
                .replace(/(丁目?|番町|条|軒|線|(の|ノ)町|地割)/, '')

              regexes.push(num.toString()) // 半角アラビア数字
              regexes.push(
                String.fromCharCode(num.toString().charCodeAt(0) + 0xfee0),
              ) // 全角アラビア数字
            }

            // 以下の正規表現は、上のよく似た正規表現とは違うことに注意！
            return `(${regexes.join(
              '|',
            )})((丁|町)目?|番町|条|軒|線|の町?|地割|[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━])`
          },
        ),
    )

    if (city.match(/^京都市/)) {
      const reg = new RegExp(`.*${regex}`)
      const match = addr.match(reg)
      if (match) {
        town = towns[i].replace(/^大字/, '')
        addr = addr.substr(match[0].length)
        break
      }
    } else {
      const reg = new RegExp(`^${regex}`)
      const match = addr.match(reg)
      if (match) {
        town = towns[i].replace(/^大字/, '')
        addr = addr.substr(match[0].length)
        break
      }
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
        return zen2han(kan2num(match)).replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, '-')
      },
    )
    .replace(
      /[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]([0-9〇一二三四五六七八九十百千]+)/g,
      (match) => {
        return zen2han(kan2num(match)).replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, '-')
      },
    )
    .replace(/([0-9〇一二三四五六七八九十百千]+)-/, (s) => {
      // `1-あ2` のようなケース
      return zen2han(kan2num(s))
    })
    .replace(/-([0-9〇一二三四五六七八九十百千]+)/, (s) => {
      // `あ-1` のようなケース
      return zen2han(kan2num(s))
    })
    .replace(/([0-9〇一二三四五六七八九十百千]+)$/, (s) => {
      // `串本町串本１２３４` のようなケース
      return zen2han(kan2num(s))
    })

  return {
    pref,
    city,
    town,
    addr,
  }
}
