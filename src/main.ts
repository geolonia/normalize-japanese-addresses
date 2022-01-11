import { createNormalizer } from './normalize'
import { fetchData } from './lib/fetch/web'

export const normalize = createNormalizer(fetchData)
