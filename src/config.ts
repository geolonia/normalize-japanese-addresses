export interface Config {
  japaneseAddressesApi: string

  /** 都道府県＋市区町村のデータを何件までキャッシュするか。デフォルト 1,000 */
  townCacheSize: number
}

export const currentConfig: Config = {
  japaneseAddressesApi: 'https://geolonia.github.io/japanese-addresses/api/ja',
  townCacheSize: 1_000,
}
