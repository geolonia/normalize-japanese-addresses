import { kanji2number } from '@geolonia/japanese-numeral'
import fetch from 'node-fetch';
import dict from './lib/dict'

const endpoint = 'https://cdn.geolonia.com/address/japan'

export const normalize = async (address: string) => {
  let addr = dict(address)

  const responsePrefs = await fetch(`${endpoint}.json`);
  const prefs = await responsePrefs.json();

  let pref = '' // 都道府県名
  for (let i = 0; i < prefs.length; i++) {
    if (0 === addr.indexOf(dict(prefs[i]))) {
      pref = prefs[i]
      addr = addr.substr(prefs[i].length) // 都道府県名以降の住所
      break
    }
  }

  const responseCities = await fetch(`${endpoint}/${encodeURI(pref)}.json`);
  const cities = await responseCities.json();

  let city = '' // 市区町村名
  for (let i = 0; i < cities.length; i++) {
    if (0 === addr.indexOf(dict(cities[i]))) {
      city = cities[i]
      addr = addr.substr(cities[i].length) // 市区町村名以降の住所
      break
    } else {
      // 以下 `xxx郡` が省略されているケースに対する対応
      if (0 < cities[i].indexOf('郡')) { // `郡山` のように `郡` で始まる地名はスキップ
        const _city = cities[i].replace(/.+郡/, '')
        if (0 === addr.indexOf(dict(_city))) {
          city = cities[i]
          addr = addr.substr(_city.length) // 市区町村名以降の住所
          break
        }
      }
    }
  }

  // 以降町丁目以降の正規化


  return pref + city + addr
}
