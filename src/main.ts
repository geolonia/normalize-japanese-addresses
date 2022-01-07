import { createNormalizer } from './normalize'
import { fetchData } from './lib/fetch/browser'

export const normalize = createNormalizer(fetchData)
