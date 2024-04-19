import { dictionary } from './dictionary'

type PatternMap = { [key: string]: string }
const patternMap = dictionary.reduce((acc: PatternMap, dictionary) => {
  const pattern = `(${dictionary.src}|${dictionary.dst})`
  // { 亞: '(亞|亜)', 亜: '(亞|亜)', 圍: '(圍|囲)', 囲: '(圍|囲)', ...}
  return { ...acc, [dictionary.src]: pattern, [dictionary.dst]: pattern }
}, {})

const regexp = new RegExp(
  Array.from(new Set(Object.values(patternMap))).join('|'),
  'g',
)

export const convert = (regexText: string) =>
  regexText.replace(regexp, (match) => patternMap[match])
