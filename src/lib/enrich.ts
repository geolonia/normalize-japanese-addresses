import { normalize } from './util'
import find from './find'

const enrich = (str: string) => {
  const normalized = normalize(str)
  const response = find(normalized)

  return {
    address: normalized,
    ...response,
  }
}

export default enrich
