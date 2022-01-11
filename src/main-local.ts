import { createNormalizer } from './normalize'
import { fetchLocalData } from './lib/fetch/local'
import { currentConfig } from './config'

export const normalize = createNormalizer(fetchLocalData)
export const config = currentConfig
