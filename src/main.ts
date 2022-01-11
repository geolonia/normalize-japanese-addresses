import { createNormalizer } from './normalize'
import { fetchData } from './lib/fetch/web'
import { currentConfig } from './config'

export const normalize = createNormalizer(fetchData)
export const config = currentConfig
