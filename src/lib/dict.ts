import { convert } from './dictionaries/convert'

export const toRegexPattern = (string: string) => {
  let _str = string

  // 以下なるべく文字数が多いものほど上にすること
  _str = _str
    .replace(/三栄町|四谷三栄町/g, '(三栄町|四谷三栄町)')
    .replace(/鬮野川|くじ野川|くじの川/g, '(鬮野川|くじ野川|くじの川)')
    .replace(/柿碕町|柿さき町/g, '(柿碕町|柿さき町)')
    .replace(/通り|とおり/g, '(通り|とおり)')
    .replace(/埠頭|ふ頭/g, '(埠頭|ふ頭)')
    .replace(/番町|番丁/g, '(番町|番丁)')
    .replace(/大冝|大宜/g, '(大冝|大宜)')
    .replace(/穝|さい/g, '(穝|さい)')
    .replace(/杁|えぶり/g, '(杁|えぶり)')
    .replace(/薭|稗|ひえ|ヒエ/g, '(薭|稗|ひえ|ヒエ)')
    .replace(/[之ノの]/g, '[之ノの]')
    .replace(/[ヶケが]/g, '[ヶケが]')
    .replace(/[ヵカか力]/g, '[ヵカか力]')
    .replace(/[ッツっつ]/g, '[ッツっつ]')
    .replace(/[ニ二]/g, '[ニ二]')
    .replace(/[ハ八]/g, '[ハ八]')
    .replace(/塚|塚/g, '(塚|塚)')
    .replace(/釜|竈/g, '(釜|竈)')
    .replace(/條|条/g, '(條|条)')
    .replace(/狛|拍/g, '(狛|拍)')
    .replace(/藪|薮/g, '(藪|薮)')
    .replace(/渕|淵/g, '(渕|淵)')
    .replace(/エ|ヱ|え/g, '(エ|ヱ|え)')
    .replace(/曾|曽/g, '(曾|曽)')
    .replace(/舟|船/g, '(舟|船)')
    .replace(/莵|菟/g, '(莵|菟)')
    .replace(/市|巿/g, '(市|巿)')

  _str = convert(_str)

  return _str
}
