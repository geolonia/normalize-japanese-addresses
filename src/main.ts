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
import dict from './lib/dict'
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
    if (0 === dict(addr).indexOf(dict(cities[i]))) {
      city = cities[i]
      addr = addr.substring(cities[i].length) // 市区町村名以降の住所
      break
    } else {
      // 以下 `xxx郡` が省略されているケースに対する対応
      if (0 < cities[i].indexOf('郡')) {
        // `郡山市` のように `郡` で始まる地名はスキップ
        const _city = cities[i].replace(/.+郡/, '')
        if (0 === dict(addr).indexOf(dict(_city))) {
          city = cities[i]
          addr = addr.substring(_city.length) // 市区町村名以降の住所
          break
        }
      }
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
  addr = addr
    .trim()
    .replace(
      /([0-9０-９]+)(丁目|丁|番町|条|軒|線|の町|号|地割|の|[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━])/g,
      (match) => {
        return match.replace(/([0-9０-９]+)/g, (num) => {
          return number2kanji(Number(zen2han(num)))
        })
      },
    )
    .replace(/^大字/, '')

  for (let i = 0; i < towns.length; i++) {
    const regex = towns[i]
      .replace(/字/g, '字?')
      .replace(/大字/g, '(大字)?')
      .replace(
        /(丁目?|番町?|条|軒|線|の町?|号|地割|[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━])/g,
        '(丁目?|番町?|条|軒|線|の町?|号|地割|[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━])',
      )
      .replace(/[之ノの]/g, '[之ノの]')
      .replace(/[ヶケが]/g, '[ヶケが]')
      .replace(/[ヵカか力]/g, '[ヵカか力]')
      .replace(/[ッツつ]/g, '[ッツつ]')
      .replace(/[ニ二]/g, '[ニ二]')
      .replace(/[ハ八]/g, '[ハ八]')
      .replace(/大冝|大宜/g, '(大冝|大宜)')
      .replace(/穝|さい/g, '(穝|さい)')
      .replace(/杁|えぶり/g, '(杁|えぶり)')
      .replace(/薭|稗|ひえ|ヒエ/g, '(薭|稗|ひえ|ヒエ)')
      .replace(/釜|竈/g, '(釜|竈)')
      .replace(/條|条/g, '(條|条)')
      .replace(/狛|拍/g, '(狛|拍)')
      .replace(/藪|薮/g, '(藪|薮)')
      .replace(/渕|淵/g, '(渕|淵)')
      .replace(/エ|ヱ|え/g, '(エ|ヱ|え)')
      .replace(/曾|曽/g, '(曾|曽)')
      .replace(/通り|とおり/g, '(通り|とおり)')
      .replace(/埠頭|ふ頭/g, '(埠頭|ふ頭)')
      .replace(/鬮野川|くじ野川|くじの川/g, '(鬮野川|くじ野川|くじの川)')

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
    .replace(
      /([(0-9〇一二三四五六七八九十百千]+)(番|番地)([(0-9〇一二三四五六七八九十百千]+)号?/,
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
