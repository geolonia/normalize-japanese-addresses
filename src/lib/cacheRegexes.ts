import { toRegexPattern } from './dict'
import { kan2num } from './kan2num'
import { zen2han } from './zen2han'
import Papaparse from 'papaparse'
import { LRUCache } from 'lru-cache'
import {
  currentConfig,
  FetchOptions,
  FetchResponseLike,
  __internals,
} from '../config'
import { findKanjiNumbers, kanji2number } from '@geolonia/japanese-numeral'
import {
  cityName,
  LngLat,
  MachiAzaApi,
  machiAzaName,
  PrefectureApi,
  prefectureName,
  SingleChiban,
  SingleCity,
  SingleMachiAza,
  SinglePrefecture,
  SingleRsdt,
} from '@geolonia/japanese-addresses-v2'

export type PrefectureList = PrefectureApi
// interface SingleTown {
//   town: string
//   originalTown?: string
//   koaza: string
//   lat: string
//   lng: string
// }
type SingleTown = SingleMachiAza
export type TownList = MachiAzaApi
interface SingleAddr {
  addr: string
  lat: string | null
  lng: string | null
}
export type AddrList = SingleAddr[]

const cache = new LRUCache({
  max: currentConfig.cacheSize,
})

/** 初回の要求を含めた試行回数の上限 */
const MAX_FETCH_ATTEMPTS = 3
const FETCH_RETRY_BASE_DELAY_MS = 100
/** サーバー側の一過性の不調とは限らないが、時間を置けば解決しうるもの */
const RETRYABLE_CLIENT_STATUS = new Set([408, 425, 429])

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const isRetryableStatus = (status: number | undefined) => {
  // ステータスコードを返さない実装では一過性かどうかを区別できないため、再試行する
  if (typeof status === 'undefined') {
    return true
  }
  // 5xx は全て再試行する。配信元の Cloudflare は origin 側の不調に対して
  // 520 から 527 を返すため、代表的な 500 / 502 / 503 / 504 の列挙では取りこぼす。
  return status >= 500 || RETRYABLE_CLIENT_STATUS.has(status)
}

const isRetryableError = (e: unknown) => {
  const code = (e as { code?: string } | null)?.code
  // ファイルが無いことは再試行しても解決しない
  return code !== 'ENOENT' && code !== 'ENOTDIR'
}

/**
 * 応答は ok だが本文が期待どおりでないことを表す。
 *
 * @remarks
 * CDN が 200 でエラーページやチャレンジページを返すことがあり、これは
 * 5xx と同じく一過性の失敗なので再試行の対象として扱う。
 */
class InvalidBodyError extends Error {}

/**
 * 本文の読み取りや解析の失敗を、再試行の対象として扱える形に変換する。
 *
 * @remarks
 * `resp.json()` は 200 で返されたエラーページに対して構文エラーを投げ、
 * `resp.text()` は本文の受信が途中で切れた場合に失敗する。どちらも 5xx と
 * 同じ一過性の失敗なので {@link InvalidBodyError} に変換する。
 * 再試行しても解決しない失敗は変換せずにそのまま伝播させる。
 */
const asInvalidBody = (e: unknown) => {
  if (!isRetryableError(e)) {
    return e
  }
  return new InvalidBodyError(e instanceof Error ? e.message : String(e), {
    cause: e,
  })
}

const decodeTarget = (input: string) => {
  try {
    // どのデータの取得に失敗したのかを読めるようにする
    return decodeURI(input)
  } catch {
    // デコードできない場合は元のまま使う
    return input
  }
}

const fetchError = (input: string, detail: string, cause?: unknown) => {
  const error: Error & { code?: string } = new Error(
    `[normalize-japanese-addresses] 住所データの取得に失敗しました: ${decodeTarget(input)}${detail}`,
    typeof cause === 'undefined' ? undefined : { cause },
  )
  const code = (cause as { code?: string } | null)?.code
  if (typeof code === 'string') {
    // 呼び出し側が e.code で分岐できる従来の挙動を保つ
    error.code = code
  }
  return error
}

/**
 * 住所データを取得する。
 *
 * @remarks
 * 応答が ok でない場合、一過性の失敗であれば数回まで再試行し、
 * それでも回復しなければ例外を投げる。
 *
 * 以前は ok を確認せずに本文を解析していたため、CDN が一過性のエラーを返すと
 * エラーページの中身を住所データとして読み、住所が黙って低い level に
 * 縮退していた。呼び出し側からは正常な結果と区別が付かないため、
 * ここで明示的に失敗させる。
 *
 * 本文の読み取りを呼び出し側から渡すのは、応答が ok でも本文が期待どおりで
 * ない場合を再試行の対象にするためである。`readBody` が
 * {@link InvalidBodyError} を投げた場合は 5xx と同じ扱いになる。
 *
 * @param input - 取得するデータのパス
 * @param options - Range リクエストの範囲
 * @param readBody - 応答から本文を読み取る関数
 */
async function fetchWithRetry<T>(
  input: string,
  options: FetchOptions | undefined,
  readBody: (resp: FetchResponseLike) => Promise<T>,
): Promise<T> {
  let lastDetail = ''
  let lastCause: unknown
  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt++) {
    let resp: FetchResponseLike
    try {
      resp = await __internals.fetch(input, options)
    } catch (e) {
      if (attempt === MAX_FETCH_ATTEMPTS || !isRetryableError(e)) {
        throw fetchError(input, e instanceof Error ? `: ${e.message}` : '', e)
      }
      await sleep(FETCH_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1))
      continue
    }

    if (resp.ok) {
      try {
        return await readBody(resp)
      } catch (e) {
        if (!(e instanceof InvalidBodyError)) {
          throw e
        }
        lastDetail = `: ${e.message}`
        lastCause = e.cause ?? e
        if (attempt === MAX_FETCH_ATTEMPTS) {
          break
        }
        await sleep(FETCH_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1))
        continue
      }
    }

    lastDetail =
      typeof resp.status === 'undefined' ? '' : ` (HTTP ${resp.status})`
    if (attempt === MAX_FETCH_ATTEMPTS || !isRetryableStatus(resp.status)) {
      break
    }
    await sleep(FETCH_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1))
  }

  throw fetchError(input, lastDetail, lastCause)
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
async function fetchFromCache<T extends {}>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  let data = cache.get(key) as T | undefined
  if (typeof data !== 'undefined') {
    return data
  }
  data = await fetcher()
  cache.set(key, data)
  return data
}

let cachedPrefecturePatterns: [SinglePrefecture, string][] | undefined =
  undefined
const cachedCityPatterns: Map<number, [SingleCity, string][]> = new Map()
let cachedPrefectures: PrefectureList | undefined = undefined
const cachedTowns: { [key: string]: TownList } = {}
let cachedSameNamedPrefectureCityRegexPatterns: [string, string][] | undefined =
  undefined

export const getPrefectures = async () => {
  if (typeof cachedPrefectures !== 'undefined') {
    return cachedPrefectures
  }

  const data = await fetchWithRetry(
    '.json', // ja.json
    {},
    async (resp) => {
      try {
        return (await resp.json()) as PrefectureApi
      } catch (e) {
        throw asInvalidBody(e)
      }
    },
  )
  return cachePrefectures(data)
}

export const cachePrefectures = (data: PrefectureList) => {
  return (cachedPrefectures = data)
}

export const getPrefectureRegexPatterns = (api: PrefectureApi) => {
  if (cachedPrefecturePatterns) {
    return cachedPrefecturePatterns
  }

  const data = api.data
  cachedPrefecturePatterns = data.map<[SinglePrefecture, string]>((pref) => {
    const _pref = pref.pref.replace(/(都|道|府|県)$/, '') // `東京` の様に末尾の `都府県` が抜けた住所に対応
    const pattern = `^${_pref}(都|道|府|県)?`
    return [pref, pattern]
  })

  return cachedPrefecturePatterns
}

export const getCityRegexPatterns = (pref: SinglePrefecture) => {
  const cachedResult = cachedCityPatterns.get(pref.code)
  if (typeof cachedResult !== 'undefined') {
    return cachedResult
  }

  const cities = pref.cities
  // 少ない文字数の地名に対してミスマッチしないように文字の長さ順にソート
  cities.sort((a, b) => {
    return cityName(a).length - cityName(b).length
  })

  const patterns = cities.map<[SingleCity, string]>((city) => {
    const name = cityName(city)
    let pattern = `^${toRegexPattern(name)}`
    if (name.match(/(町|村)$/)) {
      pattern = `^${toRegexPattern(name).replace(/(.+?)郡/, '($1郡)?')}` // 郡が省略されてるかも
    }
    return [city, pattern]
  })

  cachedCityPatterns.set(pref.code, patterns)
  return patterns
}

export const getTowns = async (
  prefObj: SinglePrefecture,
  cityObj: SingleCity,
  apiVersion: number,
) => {
  const pref = prefectureName(prefObj)
  const city = cityName(cityObj)

  const cacheKey = `${pref}-${city}`
  const cachedTown = cachedTowns[cacheKey]
  if (typeof cachedTown !== 'undefined') {
    return cachedTown
  }

  const towns = await fetchWithRetry(
    ['', encodeURI(pref), encodeURI(city) + `.json?v=${apiVersion}`].join('/'),
    {},
    async (resp) => {
      try {
        return (await resp.json()) as MachiAzaApi
      } catch (e) {
        throw asInvalidBody(e)
      }
    },
  )
  return (cachedTowns[cacheKey] = towns)
}

type MetadataRow = { start: number; length: number }

async function fetchSubresource(
  kind: '地番' | '住居表示',
  pref: SinglePrefecture,
  city: SingleCity,
  row: MetadataRow,
  apiVersion: number,
) {
  const prefN = prefectureName(pref)
  const cityN = cityName(city)
  return fetchWithRetry(
    [
      '',
      encodeURI(prefN),
      encodeURI(`${cityN}-${kind}.txt?v=${apiVersion}`),
    ].join('/'),
    {
      offset: row.start,
      length: row.length,
    },
    async (resp) => {
      let text: string
      try {
        text = await resp.text()
      } catch (e) {
        throw asInvalidBody(e)
      }
      // Range で要求した長さは既知なので、バイト長を確認するだけで
      // 200 で返されたエラーページと、Range を無視して全文が返された応答を
      // どちらも捕まえられる。ブラウザ向けの bundle にも載るため Buffer は使わない。
      const actual = new TextEncoder().encode(text).length
      if (actual !== row.length) {
        throw new InvalidBodyError(
          `期待 ${row.length} バイト、実際 ${actual} バイト`,
        )
      }
      return text
    },
  )
}

type RsdtDataRow = {
  blk_num: string
  rsdt_num: string
  rsdt_num2: string
  lng: string
  lat: string
}
type ChibanDataRow = {
  prc_num1: string
  prc_num2: string
  prc_num3: string
  lng: string
  lat: string
}
function parseSubresource<T extends SingleRsdt | SingleChiban>(
  data: string,
): T[] {
  const firstLineEnd = data.indexOf('\n')
  // const firstLine = data.slice(0, firstLineEnd)
  const rest = data.slice(firstLineEnd + 1)
  const lines = Papaparse.parse<RsdtDataRow | ChibanDataRow>(rest, {
    header: true,
  }).data
  const out: T[] = []
  for (const line of lines) {
    const point: LngLat | undefined =
      line.lng && line.lat
        ? [parseFloat(line.lng), parseFloat(line.lat)]
        : undefined
    if ('blk_num' in line) {
      out.push({
        blk_num: line.blk_num,
        rsdt_num: line.rsdt_num,
        rsdt_num2: line.rsdt_num2,
        point: point,
      } as T)
    } else if ('prc_num1' in line) {
      out.push({
        prc_num1: line.prc_num1,
        prc_num2: line.prc_num2,
        prc_num3: line.prc_num3,
        point: point,
      } as T)
    }
  }
  return out
}

export const getRsdt = async (
  pref: SinglePrefecture,
  city: SingleCity,
  town: SingleTown,
  apiVersion: number,
) => {
  const row = town.csv_ranges?.住居表示
  if (!row) {
    return []
  }

  const parsed = await fetchFromCache(
    `住居表示-${pref.code}-${city.code}-${machiAzaName(town)}`,
    async () => {
      const data = await fetchSubresource(
        '住居表示',
        pref,
        city,
        row,
        apiVersion,
      )
      const parsed = parseSubresource<SingleRsdt>(data)
      parsed.sort((a, b) => {
        const aStr = [a.blk_num, a.rsdt_num, a.rsdt_num2]
          .filter((a) => !!a)
          .join('-')
        const bStr = [b.blk_num, b.rsdt_num, b.rsdt_num2]
          .filter((a) => !!a)
          .join('-')
        return bStr.length - aStr.length
      })
      return parsed
    },
  )
  return parsed
}

export const getChiban = async (
  pref: SinglePrefecture,
  city: SingleCity,
  town: SingleTown,
  apiVersion: number,
) => {
  const row = town.csv_ranges?.地番
  if (!row) {
    return []
  }

  const parsed = await fetchFromCache(
    `地番-${pref.code}-${city.code}-${machiAzaName(town)}`,
    async () => {
      const data = await fetchSubresource('地番', pref, city, row, apiVersion)
      const parsed = parseSubresource<SingleChiban>(data)
      parsed.sort((a, b) => {
        const aStr = [a.prc_num1, a.prc_num2, a.prc_num3]
          .filter((a) => !!a)
          .join('-')
        const bStr = [b.prc_num1, b.prc_num2, b.prc_num3]
          .filter((a) => !!a)
          .join('-')
        return bStr.length - aStr.length
      })
      return parsed
    },
  )

  return parsed
}

// 十六町 のように漢数字と町が連結しているか
const isKanjiNumberFollewedByCho = (targetTownName: string) => {
  const xCho = targetTownName.match(/.町/g)
  if (!xCho) return false
  const kanjiNumbers = findKanjiNumbers(xCho[0])
  return kanjiNumbers.length > 0
}

export const getTownRegexPatterns = async (
  pref: SinglePrefecture,
  city: SingleCity,
  apiVersion: number,
) =>
  fetchFromCache<[SingleTown, string][]>(
    `${pref.code}-${city.code}`,
    async () => {
      const api = await getTowns(pref, city, apiVersion)
      const pre_towns = api.data
      const townSet = new Set(pre_towns.map((town) => machiAzaName(town)))
      // 数字表記（漢数字・全角/半角アラビア数字）の揺れを正規化した集合。
      // 「若水町３丁目」（koaza）のエイリアス「若水３丁目」と「若水三丁目」（chome）
      // のように、数字の表記が違うだけで実質的に同じ文字列になるケースの
      // コンフリクト検出に使う。
      const canonicalizeNumerals = (name: string) => kan2num(zen2han(name))
      const canonicalTownSet = new Set(
        pre_towns.map((town) => canonicalizeNumerals(machiAzaName(town))),
      )
      const towns: (
        | SingleMachiAza
        | (SingleMachiAza & { originalTown: SingleMachiAza })
      )[] = []

      const isKyoto = city.city === '京都市'

      // 町丁目に「○○町」が含まれるケースへの対応
      // 通常は「○○町」のうち「町」の省略を許容し同義語として扱うが、まれに自治体内に「○○町」と「○○」が共存しているケースがある。
      // この場合は町の省略は許容せず、入力された住所は書き分けられているものとして正規化を行う。
      // 更に、「愛知県名古屋市瑞穂区十六町1丁目」漢数字を含むケースだと丁目や番地・号の正規化が不可能になる。このようなケースも除外。
      for (const town of pre_towns) {
        towns.push(town)

        const originalTown = machiAzaName(town)
        if (originalTown.indexOf('町') === -1) continue
        const townAbbr = originalTown.replace(/(?!^町)町/g, '') // NOTE: 冒頭の「町」は明らかに省略するべきではないので、除外
        if (
          !isKyoto && // 京都は通り名削除の処理があるため、意図しないマッチになるケースがある。これを除く
          !townSet.has(townAbbr) &&
          !townSet.has(`大字${townAbbr}`) && // 大字は省略されるため、大字〇〇と〇〇町がコンフリクトする。このケースを除外
          !canonicalTownSet.has(canonicalizeNumerals(townAbbr)) &&
          !canonicalTownSet.has(canonicalizeNumerals(`大字${townAbbr}`)) &&
          !isKanjiNumberFollewedByCho(originalTown)
        ) {
          // エイリアスとして町なしのパターンを登録
          towns.push({
            machiaza_id: town.machiaza_id,
            point: town.point,
            oaza_cho: townAbbr,
            originalTown: town,
          })
        }
      }

      // 少ない文字数の地名に対してミスマッチしないように文字の長さ順にソート
      towns.sort((a, b) => {
        let aLen = machiAzaName(a).length
        let bLen = machiAzaName(b).length

        // 「大字」「字」を含む場合、優先度を低く設定する。
        // 大字XX と XXYY、大字XX字YY と XXYY が存在するケースもあるので、 XXYY を先にマッチしたい。
        // 正規表現生成時（toRegexPattern手前の /大?字/g 置換）は出現する「大字」「字」すべてを
        // 省略可能として扱うため、ここでも出現するすべての「大字」「字」の分だけ長さを差し引く。
        const discount = (name: string) =>
          (name.match(/大?字/g) || []).reduce((sum, m) => sum + m.length, 0)
        aLen -= discount(machiAzaName(a))
        bLen -= discount(machiAzaName(b))

        return bLen - aLen
      })

      const patterns: [SingleMachiAza, string][] = []

      // 住居表示・地番のデータを持たない町丁目（構造上の存在のみで、それ以上の
      // 番地照合ができないもの）かどうか。例えば「大日町」（地番・住居表示あり）
      // に対して「大日町一丁目」という小字だけの空エントリが別に存在するケースで、
      // 後者は「丁目」の記載を省略したハイフン区切り等の緩い形式にはマッチさせない。
      // マッチさせてしまうと本来番地まで正規化できるはずの「大日町」よりも先に
      // マッチしてレベル8への到達を妨げてしまう。
      const hasAddressData = (
        t: SingleMachiAza | (SingleMachiAza & { originalTown: SingleMachiAza }),
      ) => {
        const realTown = 'originalTown' in t ? t.originalTown : t
        return !!realTown.csv_ranges
      }

      // 「丁目」を省略した数字だけの緩いマッチ（下記2箇所）は、同じ「町名＋丁目数字」
      // を持つ町丁目が1つしかない場合にのみ安全に使える。例えば札幌市白石区の
      // 「本郷通八丁目北」「本郷通八丁目南」のように、丁目数字までは同じで末尾の
      // 方角（北・南）だけが異なる町丁目が複数存在する場合、緩いマッチは方角を
      // 区別できないため、配列内で先に出現した側（多くの場合たまたま北側）に
      // 常に決め打ちでマッチしてしまう。この場合は緩いマッチを諦め、末尾の方角
      // 文字列まで正しく要求する厳密なパターン（メインループ内の1つ目のパターン）
      // にマッチを委ねる。
      // 丁目番号は漢数字・全角数字・半角数字のいずれでも表記されうる。
      // 表記が違うだけで実質同じ「町名＋丁目番号」を異なるキーとして数えてしまうと、
      // 本来は複数存在する組み合わせを1件だけだと誤認し isUnambiguousChome が
      // 誤って true を返してしまう。そのためキー生成時の数字部分は
      // canonicalizeNumerals で正規化する（パターン生成に使う元の数字表記は
      // 個別のマッチ箇所でそのまま使うため、ここでは変更しない）。
      const chomeMatchPattern =
        /([^一二三四五六七八九十0-9０-９]+)([一二三四五六七八九十0-9０-９]+)(丁目?)/
      const chomeKeyCounts = new Map<string, number>()
      for (const town of towns) {
        const chomeMatch = machiAzaName(town).match(chomeMatchPattern)
        if (!chomeMatch) continue
        const key = `${chomeMatch[1]} ${canonicalizeNumerals(chomeMatch[2])}`
        chomeKeyCounts.set(key, (chomeKeyCounts.get(key) || 0) + 1)
      }
      const isUnambiguousChome = (chomeNamePart: string, chomeNum: string) =>
        chomeKeyCounts.get(
          `${chomeNamePart} ${canonicalizeNumerals(chomeNum)}`,
        ) === 1

      for (const town of towns) {
        {
          const pattern = toRegexPattern(
            machiAzaName(town)
              // 横棒を含む場合（流通センター、など）に対応
              .replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, '[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]')
              .replace(/大?字/g, '(大?字)?')
              // 以下住所マスターの町丁目に含まれる数字を正規表現に変換する
              // ABRデータには大文字の数字が含まれている（第１地割、など）ので、数字も一致するようにする
              .replace(
                /([壱一二三四五六七八九十]+|[１２３４５６７８９０]+)(丁目?|番(町|丁)|番|条|軒|線|(の|ノ)町|地割|号)/g,
                (match: string, ...rest: unknown[]) => {
                  const offset = rest[rest.length - 2] as number
                  const fullString = rest[rest.length - 1] as string
                  const patterns = []

                  patterns.push(
                    match
                      .toString()
                      .replace(
                        /(丁目?|番(町|丁)|番|条|軒|線|(の|ノ)町|地割|号)/,
                        '',
                      ),
                  ) // 漢数字

                  if (match.match(/^壱/)) {
                    patterns.push('一')
                    patterns.push('1')
                    patterns.push('１')
                  } else {
                    const num = match
                      .replace(/([一二三四五六七八九十]+)/g, (match) => {
                        return kan2num(match)
                      })
                      .replace(/([１２３４５６７８９０]+)/g, (match) => {
                        return kanji2number(match).toString()
                      })
                      .replace(
                        /(丁目?|番(町|丁)|番|条|軒|線|(の|ノ)町|地割|号)/,
                        '',
                      )

                    patterns.push(num.toString()) // 半角アラビア数字
                  }

                  // 数字の後に続く助数詞（丁目・番町・条など）は元の種類と同じもの
                  // のみを許容する。異なる種類の助数詞をまとめて許容してしまうと、
                  // 「三番町」の様な地名が「三条」など全く別の地名にもマッチしてしまう。
                  const suffix = match.replace(
                    /^([壱一二三四五六七八九十]+|[１２３４５６７８９０]+)/,
                    '',
                  )
                  let suffixAlternatives: string
                  if (/^(丁|町)目?$/.test(suffix)) {
                    suffixAlternatives = '(丁|町)目?'
                  } else if (/^番(町|丁)$/.test(suffix)) {
                    suffixAlternatives = '番(町|丁)'
                  } else if (/^(の|ノ)町$/.test(suffix)) {
                    suffixAlternatives = 'の町?'
                  } else {
                    // 条・軒・線・地割・号はそのまま（新字・旧字の揺れは toRegexPattern 側で吸収する）
                    suffixAlternatives = suffix
                  }

                  // 番地・住居表示のデータを持たない町丁目に対しては、「丁目」等の
                  // 記載を省略したハイフン区切りの緩いマッチを許容しない。
                  const hyphenFallback = hasAddressData(town)
                    ? '|[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]'
                    : ''
                  // 小字名の末尾に「北」「南」などの方角が続く町丁目に対して、
                  // 「本通14北5-15」のように「丁目」もハイフンも挟まず数字の
                  // 直後に方角が続く表記があるため、区切り文字なしでの接続も
                  // 許容する。方角などの後続文字列自体はこの後もリテラルとして
                  // 要求され続けるため、方角違いの町丁目と誤ってマッチすること
                  // にはならない。
                  const hasTrailingText =
                    offset + match.length < fullString.length
                  const noSeparatorFallback =
                    hasAddressData(town) && hasTrailingText ? '|' : ''
                  const _pattern = `(${patterns.join(
                    '|',
                  )})(${suffixAlternatives}${hyphenFallback}${noSeparatorFallback})`
                  // if (city === '下閉伊郡普代村' && town.machiaza_id === '0022000') {
                  //   console.log(_pattern)
                  // }
                  return _pattern // デバッグのときにめんどくさいので変数に入れる。
                },
              ),
          )
          patterns.push([
            'originalTown' in town ? town.originalTown : town,
            pattern,
          ])
        }

        // X丁目の丁目なしの数字だけの場合で、数字以外が続いたり終端が現れる場合は確度が高いので、先にマッチさせる
        {
          const chomeMatch = machiAzaName(town).match(chomeMatchPattern)
          // 番地・住居表示のデータを持たない町丁目は、「丁目」の記載を省略した
          // 緩いマッチの対象にしない（上の hyphenFallback と同じ理由）。
          // 同じ「町名＋丁目数字」を持つ町丁目が複数ある場合も、緩いマッチでは
          // どちらか区別できないため対象にしない（上の isUnambiguousChome 参照）。
          if (
            !chomeMatch ||
            !hasAddressData(town) ||
            !isUnambiguousChome(chomeMatch[1], chomeMatch[2])
          ) {
            continue
          }
          const chomeNamePart = chomeMatch[1]
          const chomeNum = chomeMatch[2]
          const pattern = toRegexPattern(
            `^${chomeNamePart}${kan2num(chomeNum)}([-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]|(?![0-9])|$)`,
          )
          patterns.push([town, pattern])
        }
      }

      // X丁目の丁目なしの数字だけ許容するため、最後に数字だけ追加していく
      for (const town of towns) {
        const chomeMatch = machiAzaName(town).match(chomeMatchPattern)
        if (
          !chomeMatch ||
          !hasAddressData(town) ||
          !isUnambiguousChome(chomeMatch[1], chomeMatch[2])
        ) {
          continue
        }
        const chomeNamePart = chomeMatch[1]
        const chomeNum = chomeMatch[2]
        const pattern = toRegexPattern(
          `^${chomeNamePart}(${chomeNum}|${kan2num(chomeNum)})`,
        )
        patterns.push([town, pattern])
      }

      return patterns
    },
  )

export const getSameNamedPrefectureCityRegexPatterns = (
  prefApi: PrefectureApi,
) => {
  if (typeof cachedSameNamedPrefectureCityRegexPatterns !== 'undefined') {
    return cachedSameNamedPrefectureCityRegexPatterns
  }

  const prefList = prefApi.data
  const _prefs = prefList.map((pref) => {
    return pref.pref.replace(/[都|道|府|県]$/, '')
  })

  cachedSameNamedPrefectureCityRegexPatterns = []
  for (const pref of prefList) {
    for (const city of pref.cities) {
      const cityN = cityName(city)

      // 「福島県石川郡石川町」のように、市の名前が別の都道府県名から始まっているケースも考慮する。
      for (let j = 0; j < _prefs.length; j++) {
        if (cityN.indexOf(_prefs[j]) === 0) {
          cachedSameNamedPrefectureCityRegexPatterns.push([
            `${pref.pref}${cityN}`,
            `^${cityN}`,
          ])
        }
      }
    }
  }

  return cachedSameNamedPrefectureCityRegexPatterns
}
