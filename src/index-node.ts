import { createNormalizer } from './normalize'
import { fetchLocalData } from './lib/fetch/local'
export * from './normalize'

export const normalize = createNormalizer(fetchLocalData)
