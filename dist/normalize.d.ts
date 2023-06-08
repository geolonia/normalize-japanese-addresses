/**
 * normalize {@link Normalizer} の動作オプション。
 */
export interface Config {
    /** 住所データを URL 形式で指定。 file:// 形式で指定するとローカルファイルを参照できます。 */
    japaneseAddressesApi: string;
    /** 町丁目のデータを何件までキャッシュするか。デフォルト 1,000 */
    townCacheSize: number;
    geoloniaApiKey?: string;
}
export declare const config: Config;
/**
 * 住所の正規化結果として戻されるオブジェクト
 */
export interface NormalizeResult {
    /** 都道府県 */
    pref: string;
    /** 市区町村 */
    city: string;
    /** 町丁目 */
    town: string;
    /** 住居表示住所における街区符号 */
    gaiku?: string;
    /** 住居表示住所における住居番号 */
    jyukyo?: string;
    /** 正規化後の住所文字列 */
    addr: string;
    /** 緯度。データが存在しない場合は null */
    lat: number | null;
    /** 経度。データが存在しない場合は null */
    lng: number | null;
    /**
     * 住所文字列をどこまで判別できたかを表す正規化レベル
     * - 0 - 都道府県も判別できなかった。
     * - 1 - 都道府県まで判別できた。
     * - 2 - 市区町村まで判別できた。
     * - 3 - 町丁目まで判別できた。
     * - 7 - 住居表示住所の街区までの判別ができた。
     * - 8 - 住居表示住所の街区符号・住居番号までの判別ができた。
     */
    level: number;
}
/**
 * 正規化関数の {@link normalize} のオプション
 */
export interface Option {
    /**
     * 正規化を行うレベルを指定します。{@link Option.level}
     *
     * @see https://github.com/geolonia/normalize-japanese-addresses#normalizeaddress-string
     */
    level?: number;
    /** 指定した場合、Geolonia のバックエンドを利用してより高精度の正規化を行います */
    geoloniaApiKey?: string;
}
/**
 * 住所を正規化します。
 *
 * @param input - 住所文字列
 * @param option -  正規化のオプション {@link Option}
 *
 * @returns 正規化結果のオブジェクト {@link NormalizeResult}
 *
 * @see https://github.com/geolonia/normalize-japanese-addresses#normalizeaddress-string
 */
export declare type Normalizer = (input: string, option?: Option) => Promise<NormalizeResult>;
export declare type FetchLike = (input: string) => Promise<Response | {
    json: () => Promise<unknown>;
}>;
/**
 * @internal
 */
export declare const __internals: {
    fetch: FetchLike;
};
export declare const normalize: Normalizer;
