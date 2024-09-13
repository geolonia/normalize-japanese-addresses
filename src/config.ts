import { Config } from './normalize'

export const gh_pages_endpoint =
  'https://geolonia.github.io/japanese-addresses/api/ja'

export const currentConfig: Config = {
  interfaceVersion: 3,
  japaneseAddressesApi: 'http://127.0.0.1:8080/api/ja', // gh_pages_endpoint,
  townCacheSize: 1_000,
}
