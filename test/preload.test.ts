import { normalize, preload } from '../src/main-node'
import { cachedTownRegexes } from '../src/lib/cacheRegexes'

import { performance } from 'perf_hooks'

jest.setTimeout(3 * 60 * 1000)
beforeAll(async () => {
  console.time('preload')
  await preload()
  console.timeEnd('preload')
})

test('should preload cache', () => {
  expect(cachedTownRegexes.length).toBeGreaterThan(1800)
}, 5000)

test('normalize should take less than 200ms to complete', async () => {
  const started = performance.now()
  await normalize('京都府京田辺市同志社山手４丁目１－４３')
  const finished = performance.now()
  console.log(finished - started)
  expect(finished - started).toBeLessThan(200)
}, 5000)
