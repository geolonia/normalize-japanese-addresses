import { normalize, preload } from '../src/main-node'
import { cachedTownRegexes } from '../src/lib/cacheRegexes'

jest.setTimeout(3 * 60 * 1000)
beforeAll(preload)

test('should preload cache', () => {
  expect(cachedTownRegexes.length).toBeGreaterThan(1800)
}, 5000)

test('should be fasten', async () => {
  const started = new Date().getTime()
  await normalize('京都府京田辺市同志社山手４丁目１－４３')
  const finished = new Date().getTime()
  console.log(finished - started)
  expect(finished - started).toBeLessThan(100)
}, 5000)
