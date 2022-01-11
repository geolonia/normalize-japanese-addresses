export interface Config {
  japaneseAddressesApi: string

  /** 都道府県＋市区町村のデータを何件までキャッシュするか。デフォルト 1,000 */
  townCacheSize: number

  /**
   * node_modules/@geolonia/japanese-addresses に保存された都道府県＋市区町村のデータを利用するかどうか。
   * Node.js のみで有効
   */
  usePreloadedApi?: boolean
}

export const currentConfig: Config = {
  japaneseAddressesApi: 'https://geolonia.github.io/japanese-addresses/api/ja',
  townCacheSize: 1_000,
  usePreloadedApi: true,
}
