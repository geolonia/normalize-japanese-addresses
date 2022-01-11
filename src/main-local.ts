import { createNormalizer } from './normalize'
import { fetchLocalData } from './lib/fetch/local'

export const normalize = createNormalizer(fetchLocalData)
