export const zen2han = (str: string) => {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
    if ('ー' === s || '−' === s) {
      return '-'
    } else {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0)
    }
  })
}
