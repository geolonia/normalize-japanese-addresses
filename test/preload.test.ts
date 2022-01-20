import { normalize, config, preload } from '../src/main-node'
import { cachedTownRegexes } from '../src/lib/cacheRegexes'
import path from 'path'
import { performance } from 'perf_hooks'
import unfetch from 'isomorphic-unfetch'
jest.mock('isomorphic-unfetch') // disable request for testing

jest.setTimeout(3 * 60 * 1000)
beforeAll(async () => {
  config.preloadCache = true
  config.japaneseAddressesApi =
    'file:/' + path.resolve(__dirname, 'japanese-addresses-master.zip')
  console.time('preload')
  await preload()
  console.timeEnd('preload')
  jest.setTimeout(5000)
})

test('should preload cache', () => {
  expect(cachedTownRegexes.length).toBeGreaterThan(1800)
})

test('normalize should complete in the local environment', async () => {
  const started = performance.now()
  await normalize('京都府京田辺市同志社山手４丁目１－４３')
  const finished = performance.now()
  console.log('performance(ms): ', finished - started)
  expect(unfetch).not.toBeCalled()
})
