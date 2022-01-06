export interface Config {
  japaneseAddressesApi: string

  /** 都道府県＋市区町村のデータを何件までキャッシュするか。デフォルト 1,000 */
  townCacheSize: number

  /** 都道府県＋市区町村のデータをファイルシステムにキャッシュするかどうか */
  preloadTownCache: boolean

  /** 都道府県＋市区町村のファイルシステムキャッシュの有効期限(単位: ミリ秒) */
  preloadedTownCacheExpiresIn: number
}

export const currentConfig: Config = {
  japaneseAddressesApi: 'https://geolonia.github.io/japanese-addresses/api/ja',
  townCacheSize: 1_000,
  preloadTownCache: false,
  preloadedTownCacheExpiresIn: 24 * 60 * 60 * 1000,
}
