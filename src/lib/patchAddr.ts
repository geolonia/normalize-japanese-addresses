const pattern = [
  {
    pref: '香川県',
    city: '仲多度郡まんのう町',
    town: '勝浦',
    pattern: '^字?家6',
    result: '家六',
  },
  {
    pref: '愛知県',
    city: 'あま市',
    town: '西今宿',
    pattern: '^字?梶村1',
    result: '梶村一',
  },
  {
    pref: '香川県',
    city: '丸亀市',
    town: '原田町',
    pattern: '^字?東三分1',
    result: '東三分一',
  },
]

export const patchAddr = (
  pref: string,
  city: string,
  town: string,
  addr: string,
): string => {
  let _addr = addr
  for (let i = 0; i < pattern.length; i++) {
    if (
      pattern[i].pref === pref &&
      pattern[i].city === city &&
      pattern[i].town === town
    ) {
      const regex = new RegExp(pattern[i].pattern)
      _addr = _addr.replace(regex, pattern[i].result)
    }
  }

  return _addr
}
