import { createNormalizer } from './normalize'
import { fetchLocalData } from './lib/fetch/node'
import { currentConfig } from './config'

export const normalize = createNormalizer(fetchLocalData)
export const config = currentConfig
