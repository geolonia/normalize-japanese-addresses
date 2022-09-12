import { normalize, config } from '../src/main-node'
import path from 'path'
import { performance } from 'perf_hooks'
import unfetch from 'isomorphic-unfetch'
jest.mock('isomorphic-unfetch') // disable request for testing

const defaultEndpoint = config.japaneseAddressesApi

describe('file://', () => {
  jest.setTimeout(3 * 60 * 1000)
  beforeAll(async () => {
    config.japaneseAddressesApi =
      'file://' +
      path.resolve(__dirname, 'japanese-addresses-master', 'api', 'ja')
    jest.setTimeout(5000)
  })

  test('normalize should complete in the local environment', async () => {
    const started1 = performance.now()
    await normalize('京都府京田辺市同志社山手４丁目１－４３')
    const finished1 = performance.now()
    console.log('nocache performance(ms): ', finished1 - started1)

    const started2 = performance.now()
    await normalize('京都府京田辺市同志社山手４丁目１－４４')
    const finished2 = performance.now()
    console.log('with-cache performance(ms): ', finished2 - started2)

    expect(unfetch).not.toBeCalled()
  })
})

describe('http://', () => {
  jest.setTimeout(3 * 60 * 1000)
  beforeAll(async () => {
    config.japaneseAddressesApi = defaultEndpoint
    config.geoloniaApiKey = 'MY-KEY'
    jest.setTimeout(5000)
  })

  test('Should request with Geolonia backend', async () => {
    await normalize('京都府京田辺市同志社山手４丁目１－４４')
    expect(unfetch).toBeCalled()
    const args = (unfetch as jest.Mock).mock.calls[0]
    expect(args[0]).toMatch(/geolonia-api-key=MY-KEY$/)
  })
})
