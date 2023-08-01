import { Config } from './normalize'

export const gh_pages_endpoint =
  'https://geolonia.github.io/japanese-addresses/api/ja'

export const currentConfig: Config = {
  interfaceVersion: 1,
  japaneseAddressesApi: gh_pages_endpoint,
  townCacheSize: 1_000,
}
