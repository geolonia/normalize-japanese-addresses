import os from 'os'
import path from 'path'
import {
  kanji2number,
  number2kanji,
  findKanjiNumbers,
} from '@geolonia/japanese-numeral'
const tmpdir = path.join(os.tmpdir(), 'normalize-japanese-addresses')
const fetch = require('node-fetch-cache')(tmpdir)
import dict from './lib/dict'

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

export const normalize = async (address: string) => {
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
    throw new Error("Can't detect the prefecture.")
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
    if (0 === addr.indexOf(cities[i])) {
      city = cities[i]
      addr = addr.substring(cities[i].length) // 市区町村名以降の住所
      break
    } else {
      // 以下 `xxx郡` が省略されているケースに対する対応
      if (0 < cities[i].indexOf('郡')) {
        // `郡山` のように `郡` で始まる地名はスキップ
        const _city = cities[i].replace(/.+郡/, '')
        if (0 === zen2han(addr).indexOf(_city)) {
          city = cities[i]
          addr = addr.substring(_city.length) // 市区町村名以降の住所
          break
        }
      }
    }
  }

  if (!city) {
    throw new Error("Can't detect the city.")
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

  addr = kan2num(addr).replace(/の([0-9]+)/g, (s) => {
    return s.replace('の', '-')
  })

  const units = '(丁目|丁|番町|条|軒|線|の町|号|地割|-)'

  let town = ''
  addr = addr.trim()
  for (let i = 0; i < towns.length; i++) {
    const reg = new RegExp(`[〇一二三四五六七八九十百千]+${units}`, 'g')
    const _town = dict(towns[i]).replace(reg, (s) => {
      return kan2num(s) // API からのレスポンスに含まれる `n丁目` 等の `n` を数字に変換する。
    })

    const regex = new RegExp(
      _town.replace(
        /([0-9]+)(丁目|丁|番町|条|軒|線|の町|号|地割|-)/gi,
        `$1${units}`,
      ),
    )
    const match = dict(zen2han(addr)).match(regex)
    if (match) {
      town = kan2num(towns[i]).replace(/^大字/, '')
      const _m = addr.match(/字/g)
      if (_m && _m.length) {
        // 住所内に `字` がある場合、正規化でそれらを削除してしまっているので、その文字数分だけずれるのでそれを補正する。
        addr = addr.substring(dict(zen2han(addr)).lastIndexOf(match[0]) + match[0].length + _m.length) // 町丁目以降の住所
      } else {
        addr = addr.substring(dict(zen2han(addr)).lastIndexOf(match[0]) + match[0].length) // 町丁目以降の住所
      }
      break
    }
  }

  addr = zen2han(addr)

  // 町名部分に対する例外的な処理
  town = town.replace(/([0-9])軒町/, (s, p1) => {
    return `${number2kanji(parseInt(p1))}軒町` // 京都などに存在する `七軒町` などの地名の数字を漢数字に戻す
  })

  if (!town) {
    throw new Error("Can't detect the town.")
  }

  addr = addr
    .replace(/([(0-9]+)(番|番地)([0-9]+)号/, '$1-$3')
    .replace(/([0-9]+)番地/, '$1')

  let building = "";
  const regexBuilding = new RegExp(/-[0-9]*/, 'g') //-（ハイフン）数字を抽出
  const matchBuilding = addr.match(regexBuilding)

  if( matchBuilding && matchBuilding.length ){
    building = addr.substring(addr.lastIndexOf(matchBuilding[matchBuilding.length -1]) + matchBuilding[matchBuilding.length -1].length) //半角数字に変換されたビル名を取得
    addr = addr.replace(building,'') // 町丁目の住所

    building = building
    .replace(/\s+/g,'')
    .replace(/(([0-9])(?![0-9]*[階|号室|号棟|番館])(?!第[0-9]*))/, (s, p1) => {
      return `${number2kanji(parseInt(p1))}`
    })
  }

  return {
    pref: pref,
    city: city,
    town: town,
    addr: addr,
    building:building
  }
}
