import find from './lib/find'
import util from './lib/util'

const enrichment = str => {

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

  if (!response || response.multipleChoice) {
    throw new Error('見つかりませんでした。住所を修正して、もう一度お試しください。')
  }

  return response.code
}

export default enrichment
