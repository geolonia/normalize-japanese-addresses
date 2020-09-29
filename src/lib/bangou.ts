import { a2h } from './util'

type Bangou = {
  番地?: string
  号?: string
}

export default (src: string) => {
  const dst: Bangou = {}

  if (
    src.match(
      /^([0-9０-９一二三四五六七八九十〇]+)(番地|番)([0-9０-９一二三四五六七八九十〇]+)号/,
    )
  ) {
    const v = [RegExp.$1, RegExp.$3].map((x) => a2h(x))
    dst['番地'] = v[0]
    dst['号'] = v[1]
  } else if (
    src.match(
      /^([0-9０-９一二三四五六七八九十〇]+)(ー|－|-)([0-9０-９一二三四五六七八九十〇]+)/,
    )
  ) {
    const v = [RegExp.$1, RegExp.$3].map((x) => a2h(x))
    dst['番地'] = v[0]
    dst['号'] = v[1]
  } else if (src.match(/^([0-9０-９一二三四五六七八九十〇]+)(番地|番)/)) {
    const v = [RegExp.$1].map((x) => a2h(x))
    dst['番地'] = v[0]
  } else if (src.match(/^([0-9０-９一二三四五六七八九十〇]+)/)) {
    const v = [RegExp.$1].map((x) => a2h(x))
    dst['番地'] = v[0]
  }
  return dst
}
