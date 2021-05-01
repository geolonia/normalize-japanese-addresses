import axios from 'axios'
import { setupCache } from 'axios-cache-adapter'
import { toRegex } from './dict'
import { kan2num } from './kan2num'

const apiCache = setupCache({
  maxAge: 24 * 60 * 60 * 1000, // 1日間キャッシュ
  limit: 10000,
})

const apiFetch = axios.create({
  adapter: apiCache.adapter,
})

const endpoint = 'https://geolonia.github.io/japanese-addresses/api/ja'


let cachedPrefectureRegexes: [string, RegExp][] | undefined = undefined
const cachedCityRegexes: { [key: string]: [string, RegExp][] } = {}
const cachedTownRegexes: { [key: string]: [string, RegExp][] } = {}

export const getPrefectures = async () => {
  return await apiFetch(`${endpoint}.json`)
}

export const getPrefectureRegexes = (prefs: string[]) => {
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


export const getCityRegexes = (pref: string, cities: string[]) => {
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

export const getTownRegexes = async (pref: string, city: string) => {
  const cachedResult = cachedTownRegexes[`${pref}-${city}`]
  if (typeof cachedResult !== 'undefined') {
    return cachedResult
  }

  const responseTowns = await apiFetch(
    `${endpoint}/${encodeURI(pref)}/${encodeURI(city)}.json`,
  )
  const towns = responseTowns.data as string[]

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
            }

            // 以下の正規表現は、上のよく似た正規表現とは違うことに注意！
            const _regex = `(${regexes.join(
              '|',
            )})((丁|町)目?|番(町|丁)|条|軒|線|の町?|地割|[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━])`

            return _regex // デバッグのときにめんどくさいので変数に入れる。
          },
        ),
    )

    if (city.match(/^京都市/)) {
      return [town, new RegExp(`.*${regex}`)]
    } else {
      return [town, new RegExp(`^${regex}`)]
    }
  }) as [string, RegExp][]

  cachedTownRegexes[`${pref}-${city}`] = regexes
  return regexes
}
