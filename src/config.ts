export interface Config {
  japaneseAddressesApi: string

  /** 町丁目のデータを何件までキャッシュするか。デフォルト 1,000 */
  townCacheSize: number

  /** あらかじめ町丁目のデータをキャッシュするかどうか。このオプションを指定した場合、 {@link Config.townCacheSize} の値は無視されます。 */
  preloadCache?: boolean
}

export const currentConfig: Config = {
  japaneseAddressesApi: 'https://geolonia.github.io/japanese-addresses/api/ja',
  townCacheSize: 1_000,
  preloadCache: false,
}
