const dict = {
  大字: '',
  字: '',
  ヶ: 'が',
  ケ: 'が',
  之: 'の',
  ノ: 'の',
  ヵ: 'か',
  カ: 'か',
  大冝: '大宜',
  穝: 'さい',
  杁: 'えぶり',
  塩釜: '塩竈',
  三宅島三宅村: '三宅村',
  八丈島八丈町: '八丈町',
  長野市東の門町: '長野市長野東の門町', // https://github.com/geolonia/community-geocoder/issues/52
  神田猿楽町: '猿楽町', // https://github.com/geolonia/community-geocoder/issues/60
  神田三崎町: '三崎町', // https://github.com/geolonia/community-geocoder/issues/60
  那珂川市: '筑紫郡那珂川町', // https://github.com/geolonia/community-geocoder/issues/66
}

const replace = str => {
  for (let key in dict) {
    str = str.replace(key, dict[key])
  }

  return str
}

export default replace
