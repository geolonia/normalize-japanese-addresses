import { createNormalizer } from './normalize'
import { fetchLocalData, preloadJapaneseAddresses } from './lib/fetch/node'

export const normalize = createNormalizer(fetchLocalData)
export const preload = preloadJapaneseAddresses
