import { createNormalizer } from './normalize'
import { fetchLocalData } from './lib/fetch/node'

export const normalize = createNormalizer(fetchLocalData)
