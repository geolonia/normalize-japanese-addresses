import { Config } from './normalize'

export const defaultEndpoint = 'http://127.0.0.1:8080/api/ja'

export const currentConfig: Config = {
  japaneseAddressesApi: defaultEndpoint,
  cacheSize: 1_000,
}
