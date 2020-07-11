import dict from './dict'

const replacer = function(keyval) {
  const reg = new RegExp('[' + Object.keys(keyval).join('') + ']', 'g')
  const rep = a => keyval[a]
  return src => src.replace(reg, rep)
}

const table = {}
const list = [];

['', '千', '二千', '三千', '四千', '五千', '六千', '七千', '八千', '九千'].forEach((s1, i1) => {
  ['', '百', '二百', '三百', '四百', '五百', '六百', '七百', '八百', '九百'].forEach((s2, i2) => {
    ['', '十', '二十', '三十', '四十', '五十', '六十', '七十', '八十', '九十'].forEach((s3, i3) => {
      ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'].forEach((s4, i4) => {
        let key = s1 + s2 + s3 + s4
        if (key.length === 0) key = '零'
        const val = i1 * 1000 + i2 * 100 + i3 * 10 + i4
        table[key] = val
        list[val] = key
      })
    })
  })
})

const deepStrictEqual = function(expected, actual) {
  if (typeof expected !== typeof actual) return false

  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) return false
    if (expected.length !== actual.length) return false
    if (expected.find((x, i) => !deepStrictEqual(x, actual[i]))) return false
    return true
  }

  if (typeof expected === 'object') {
    const k1 = Object.keys(expected)
    const k2 = Object.keys(actual)
    if (k1.length !== k2.length) return false
    if (k1.find(k => k2.indexOf(k) === -1)) return false
    if (k1.find(k => !deepStrictEqual(expected[k], actual[k]))) return false
    return true
  }
  return expected === actual
}

const Util = {
  // ツリー作成・検索のための地名文字列の単純化
  simplify: replacer({
    ヶ: 'ケ',
  }),
  // 全角数字を半角数字に変換
  z2h: replacer({
    '０': '0',
    '１': '1',
    '２': '2',
    '３': '3',
    '４': '4',
    '５': '5',
    '６': '6',
    '７': '7',
    '８': '8',
    '９': '9',
  }),
  // 全角数字を半角数字に変換
  h2z: replacer({
    0: '０',
    1: '１',
    2: '２',
    3: '３',
    4: '４',
    5: '５',
    6: '６',
    7: '７',
    8: '８',
    9: '９',
  }),
  // 漢数字を半角数字に変換
  k2h: replacer({
    〇: '0',
    一: '1',
    二: '2',
    三: '3',
    四: '4',
    五: '5',
    六: '6',
    七: '7',
    八: '8',
    九: '9',
  }),
  // 半角数字を漢数字に変換
  h2k: replacer({
    0: '〇',
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六',
    7: '七',
    8: '八',
    9: '九',
  }),
  // 漢字表記（一十百千万億）を半角数字に
  j2h: function(a) {
    const x = a.replace(/一千/g, '千')
    for (let end = x.length; end > 0; end--) {
      const head = x.substring(0, end)
      const tail = x.substring(end)
      if (typeof table[head] !== 'undefined') {
        let n = table[head]
        if (tail.match(/^([京兆億万])(.*)$/)) {
          const unit = RegExp.$1
          const rest = RegExp.$2
          if (unit === '京') n *= Math.pow(10, 16)
          if (unit === '兆') n *= Math.pow(10, 12)
          if (unit === '億') n *= Math.pow(10, 8)
          if (unit === '万') n *= Math.pow(10, 4)
          n += parseInt(Util.j2h(rest))
        }
        return n.toString()
      }
    }
    return '0'
  },
  // 半角数字を漢字表記（一十百千万億）に
  h2j: function(a) {
    let n = parseInt(a)
    let s = '';
    ['京', '兆', '億', '万'].forEach((unit, i) => {
      const base = Math.pow(10, 16 - i * 4)
      if (n >= base) {
        const b = Math.floor(n / base)
        s += list[b] + unit
        n = n % base
      }
    })
    s += list[n]
    return s
  },
  z2k: function(a) {
    return Util.h2k(Util.z2h(a))
  },
  k2z: function(a) {
    return Util.h2z(Util.k2h(a))
  },
  // any to hankaku
  a2h: function(a) {
    if (a.match(/^[0-9]+$/)) return a
    if (a.match(/^[０-９]+$/)) return Util.z2h(a)
    if (a.match(/^[〇一二三四五六七八九]+$/)) return Util.k2h(a)
    if (a.match(/^[一二三四五六七八九千百十万億兆京]+$/)) return Util.j2h(a)
    return a
  },
  // 地名文字列を正規化して返す。丁目は半角数字にする。空白はトリム。OCR由来の誤字を修正。
  normalize: function(name) {
    if (name.endsWith('　')) return Util.normalize(name.replace(/[　]+$/, ''))

    name = dict(name)

    const units = ['番町', '条', '軒', '線', 'の町', '号', '地割']

    for (let i = 0; i < units.length; i++) {
      const regexp = new RegExp(`^.*?(([0-9]+|[０-９]+)(${units[i]}))`)
      if (name.match(regexp)) {
        const original = RegExp.$2
        const normalized = Util.h2j(Util.z2h(original))
        name = name.replace(`${original}${units[i]}`, `${normalized}${units[i]}`)
      }
    }

    // 数字丁を漢数字に（堺市）
    if (name.match(/^.*?(([0-9]+|[０-９]+)(丁(?!目)))/)) {
      const original = RegExp.$2
      const normalized = Util.h2j(Util.z2h(original))
      name = name.replace(`${original}丁`, `${normalized}丁`)
    }

    if (name.match(/^.*?(([0-9]+|[０-９]+)(丁目))/)) {

      // 一見すると正しいが、実は漢数字ではない
      if (name.endsWith('ニ丁目')) return Util.normalize(name.replace('ニ丁目', '二丁目'))
      if (name.endsWith('ー丁目')) return Util.normalize(name.replace('ー丁目', '一丁目'))
      if (name.endsWith('ハ丁目')) return Util.normalize(name.replace('ハ丁目', '八丁目'))
      if (name.endsWith('十〇丁目')) return Util.normalize(name.replace('十〇丁目', '十丁目'))

      // 丁目の反復を修正
      if (name.match(/^(.+丁目)(.+丁目)$/)) {
        const r = [RegExp.$1, RegExp.$2]
        if (r[0].endsWith(r[1])) name = Util.normalize(r[0])
      }

      // 数字丁目を漢数字
      if (name.match(/^.*?(([0-9]+|[０-９]+)(丁目))/)) {
        const original = RegExp.$2
        const normalized = Util.h2j(Util.z2h(original))
        name = name.replace(`${original}丁目`, `${normalized}丁目`)
      }
    }

    return name
  },
  deepStrictEqual: deepStrictEqual,
  put: function(s, p, o) {
    if (typeof s[p] === 'undefined') {
      s[p] = o
    } else if (Array.isArray(s[p])) {
      if (s[p].find(x => typeof deepStrictEqual(x, o)) === 'undefined')
        s[p].push(o)
    } else if (!deepStrictEqual(s[p], o)) {
      s[p] = [s[p], o]
    }
    return s
  },
}

export default Util
