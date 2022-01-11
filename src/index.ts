import { createNormalizer } from './normalize'
import { fetchData } from './lib/fetch/web'
export * from './normalize'

export const normalize = createNormalizer(fetchData)
