import * as Normalize from './normalize'
import { fetchData } from './lib/fetch/web'
import { currentConfig } from './config'

export const config = currentConfig
export const normalize = Normalize.createNormalizer(fetchData)
