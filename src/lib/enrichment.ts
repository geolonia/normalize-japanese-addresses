import { normalize } from './util'
import find from './find'

const enrichment = (address: string) => {
  const normalized = normalize(address)
  const response = find(normalized)

  return {
    address: normalized,
    ...response,
  }
}

export default enrichment
