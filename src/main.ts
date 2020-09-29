import find from './lib/find'
import util from './lib/util'

const enrichment = (str: string) => {
  const normalized = util.normalize(str)

  const target = {
    '@context': 'https://imi.go.jp/ns/core/context.jsonld',
    '@type': '場所型',
    住所: {
      '@type': '住所型',
      表記: normalized,
    },
  }

  const address = target['住所'] || target
  const response = find(address['表記'])

  // @ts-ignore
  if (!response || response.multipleChoice) {
    return null
  }

  return response.code
}

export default enrichment
