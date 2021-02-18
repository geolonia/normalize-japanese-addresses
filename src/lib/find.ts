import { simplify, k2h, z2h, h2j } from './util'
import dict from './dict'
import { number2kanji } from '@geolonia/japanese-numeral'
// @ts-ignore
import treeJSON from './tree.json'

// tree の構造変更
const tree = (function (src) {
  const map: any = {}
  const moved: any = {}

  const dig = function (src: any) {
    const list: any = []

    Object.keys(src).forEach((key) => {
      const val = src[key]
      const obj: any = {
        // @ts-ignore
        code: key.match(/^[0-9]+/)[0],
        label: key.replace(/^[0-9]+/, ''),
      }

      if (typeof val === 'object') {
        obj.children = dig(val).map((child: any) => {
          child.parent = obj
          if (child.code.length !== 5) {
            child.code = obj.code + child.code
          }
          return child
        })
      } else if (typeof val === 'number') {
        obj.chome = val
      } else if (typeof val === 'string') {
        moved[key] = val
      }

      if (obj.code.length === 5) map[key] = obj

      list.push(obj)
    })

    return list
  }
  const root = dig(src)

  Object.keys(moved).forEach((from) => {
    map[from].next = map[moved[from]]
  })

  return root
})(treeJSON)

// 1. 市区町村の特定
// 2-1. n=1 の場合: 下位地名の探索
// 2-2. n>1 の場合: 下位地名の探索> 絞り込み
// 2-3. n=0 の場合: ユニーク下位地名の探索

const upper = (function () {
  const map: any = {}
  const dig = function (list: any[]) {
    list.forEach((focus) => {
      if (focus.code.length === 5) {
        const s = [dict(focus.label)]
        for (let f = focus.parent; f; f = f.parent) {
          s.forEach((t) => {
            s.push(dict(f.label) + t)
          })
        }
        s.forEach((x) => {
          if (typeof map[x] === 'undefined') map[x] = []
          map[x].push(focus)
        })
      }
      if (focus.children) dig(focus.children)
    })
  }
  dig(tree)

  // 名前が同じでコードだけが違うパターンでは最新のものだけを残す
  const fullname = (e: any): any =>
    (e.parent ? fullname(e.parent) : '') + e.label
  Object.keys(map).forEach((key) => {
    const list = map[key]
    map[key] = list.filter((a: any) => {
      if (typeof a.next === 'undefined') return true
      if (
        list.find(
          (b: any) => a !== b && a.next === b && fullname(a) === fullname(b),
        )
      )
        return false
      return true
    })
  })

  return map
})()

const lower = (function () {
  const map: any = {}

  const dig = function (list: any[]) {
    list.forEach((focus) => {
      if (typeof focus.children !== 'undefined') {
        dig(focus.children)
      }
      if (typeof focus.chome !== 'undefined') {
        if (typeof map[focus.label] === 'undefined') map[focus.label] = []
        map[focus.label].push(focus)
      }
    })
  }
  dig(tree)

  Object.keys(map).forEach((key) => {
    if (map[key].length === 1) map[key] = map[key][0]
    else delete map[key]
  })

  return map
})()

const find = (normalizedAddress: string) => {
  let normalized = simplify(normalizedAddress).trim()
  normalized = normalized.replace(/\s/g, '')
  if (
    normalized.match(
      /^((東京都)|(北海道)|((大阪)|(京都)府)|(.+県))(.+[郡])(.+[町村].*)$/,
    )
  ) {
    normalized = RegExp.$1 + RegExp.$9
  } else if (normalized.match(/^(.+[郡])(.+[町村].*)$/)) {
    normalized = RegExp.$2
  }

  // 正解と末尾をもとに丁目コードを追加して返す
  const fix = function (hit: any, tail: string) {
    if (hit.chome > 0) {
      if (!tail.trim().match(/^[0-9０-９一二三四五六七八九十〇]+/)) {
        return {
          code: hit.code,
          tail: tail,
          expectedChome: hit.chome,
          actualChome: null,
        }
      }
      // @ts-ignore
      let chome = tail.trim().match(/^[0-9０-９一二三四五六七八九十〇]+/)[0]
      let rest = tail.trim().substring(chome.length)

      // Note: Following conditions should be moved to `z2h()`.
      if (chome.match(/^十/)) {
        if ('十' === chome) {
          chome = '10'
        } else {
          chome = k2h(z2h(chome)).replace(/^十/, '1')
        }
      } else if (chome.match(/十$/)) {
        chome = k2h(z2h(chome)).replace(/十$/, '0')
      } else {
        chome = k2h(z2h(chome)).replace('十', '')
      }

      if (chome.match(/^([0-9]+)$/)) {
        while (chome.length < 3) chome = '0' + chome
        rest = rest.replace(/^(丁目|-)/, '')
        if (hit.chome < parseInt(chome))
          return {
            code: hit.code,
            tail: rest,
            expectedChome: hit.chome,
            actualChome: parseInt(chome),
          }
        return {
          code: hit.code + chome,
          tail: rest,
        }
      }
    }
    return {
      code: hit.code + (hit.code.length === 9 ? '000' : ''),
      tail: tail,
    }
  }

  /**
   * 「重複する 町名・村名」+「大字・字」の検索時に指定の住所データを取得
   * @param {string} normalized
   * @param {*} answer
   */
  const getUniqueAddressFromSameName = (normalized: any, answer: any) => {
    const uniqueAddressIndex = answer.findIndex((singleAnswer: any) => {
      if (!singleAnswer.children && singleAnswer.label === normalized) {
        return false
      }

      // 重複している町村名以下を取得
      const regExp = new RegExp(singleAnswer.label, 'g')
      normalized = normalized.replace(regExp, '')

      let match
      for (let i = 0; i < singleAnswer.children.length; i++) {
        // 大字・字・字なしの条件でチェック
        const child = singleAnswer.children[i]
        if (
          child.label === normalized ||
          child.label === `大字${normalized}` ||
          child.label === `字${normalized}`
        ) {
          match = true
          break
        } else {
          match = false
        }
      }
      return match
    })

    if (-1 === uniqueAddressIndex) {
      return answer
    } else {
      return [answer[uniqueAddressIndex]]
    }
  }

  // 市区町村にヒットする場合
  for (let i = normalized.length; i >= 0; i--) {
    const head = normalized.substring(0, i)
    let answer = upper[head]

    if (typeof answer !== 'undefined') {
      if (answer.length > 1) {
        // 大字を追加して再検索
        answer = getUniqueAddressFromSameName(normalized, answer)

        if (answer.length > 1) {
          return {
            multipleChoice: true,
          }
        }
      }

      let latest = answer[0]
      let number = i

      // コードが261（京都市を指す）で始まる場合は通り名が含まれているものとみなす
      if (answer[0].code.startsWith('261') && normalized.substring(i)) {
        const result: any = { code: '', tail: '' }
        const children = answer[0].children

        // 文字数が少ない順にソート（東松屋町が松屋町にマッチしないようにするため）
        children.sort((a: any, b: any) => {
          if (a.label.length > b.label.length) return 1
          if (a.label.length < b.label.length) return -1
          return 0
        })

        let lastIndex = 0
        let match = ''
        for (let k = 0; k < children.length; k++) {
          const item = children[k]
          const index = normalized.substring(i).lastIndexOf(item.label)

          if (0 <= index) {
            if (match && 0 <= item.label.indexOf(match)) {
              // https://github.com/geolonia/community-geocoder/issues/37
              const parts = normalized.substring(i).split(item.label)
              result.code = `${item.code}${(
                Array(3).join('0') + item.chome
              ).slice(-3)}`
              result.normalized = `京都府京都市${answer[0].label}${item.label}${
                parts[parts.length - 1]
              }`
              result.answer = item
            } else {
              if (index > lastIndex) {
                // See https://github.com/geolonia/community-geocoder/issues/10
                lastIndex = index
                const parts = normalized.substring(i).split(item.label)
                result.code = `${item.code}${(
                  Array(3).join('0') + item.chome
                ).slice(-3)}`
                result.normalized = `京都府京都市${answer[0].label}${
                  item.label
                }${parts[parts.length - 1]}`
                result.answer = item
              }
            }
            match = item.label
          }
        }

        if (result.code) {
          normalized = result.normalized
          number = 6 + answer[0].label.length // 通り名を削除したので文字数を補正
        }
      }

      while (latest.next) latest = latest.next
      for (let j = normalized.length; j > number; j--) {
        let body = normalized.substring(number, j)
        let tail = normalized.substring(j).trim()

        // See https://github.com/geolonia/community-geocoder/issues/75.
        let hit = latest.children.find((child: any) => {
          let name = child.label
          if (child.chome) {
            const chome = `${h2j(child.chome)}丁目`
            name = `${child.label}${chome}`
            if (body === dict(name)) {
              tail = normalized.substring(normalized.indexOf(chome)).trim()
              return true
            } else {
              return false
            }
          }

          return false
        })
        if (typeof hit === 'undefined') {
          hit = latest.children.find((child: any) => {

            // 「半角数字  -（ハイフン）」の住所に対応
            // See https://github.com/geolonia/community-geocoder/issues/87
            if (body.match(/[0-9０-９]+/)) {
              body = body.replace(/[0-9０-９]+/, function(match) {
                const chomeNumber = parseInt(z2h(match), 10)
                return number2kanji(chomeNumber)
              })
            }

            const bodyAddChome = body.replace('-', '丁目')
            const bodyAddCho = body.replace('-', '丁')
            if (body === dict(child.label) || bodyAddChome === dict(child.label) || bodyAddCho === dict(child.label)) {
              return true
            } else {
              return false
            }
          })
        }

        if (typeof hit !== 'undefined') {
          const response = fix(hit, tail)
          if (typeof response.expectedChome !== 'undefined') {
            let t = '' + response.expectedChome
            while (t.length < 3) t = '0' + t
            response.code = response.code + t
          }

          return response
        }
      }

      return {
        code: answer[0].code,
        tail: normalized.substring(i),
        multipleChoice: false,
      }
    }
  }

  // 市区町村にヒットしない場合
  for (let i = normalized.length; i >= 0; i--) {
    const hit = lower[normalized]
    if (typeof hit !== 'undefined') {
      const tail = normalized.substring(i).trim()
      const response = fix(hit, tail)
      if (typeof response.expectedChome !== 'undefined') {
        let t = '' + response.expectedChome
        while (t.length < 3) t = '0' + t
        response.code = response.code + t
      }

      return { ...response, multipleChoice: false }
    }
  }

  return null
}

export default find
