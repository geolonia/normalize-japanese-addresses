import * as Normalize from './normalize'
import { fetchLocalData } from './lib/fetch/local'
import { currentConfig } from './config'

export const config = currentConfig
export const normalize = Normalize.createNormalizer(fetchLocalData)
