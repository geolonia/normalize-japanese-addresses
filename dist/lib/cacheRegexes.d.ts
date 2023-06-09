declare type PrefectureList = {
    [key: string]: string[];
};
interface SingleTown {
    town: string;
    originalTown?: string;
    koaza: string;
    lat: string;
    lng: string;
}
declare type TownList = SingleTown[];
interface GaikuListItem {
    gaiku: string;
    lat: string;
    lng: string;
}
interface SingleResidential {
    gaiku: string;
    jyukyo: string;
    lat: string;
    lng: string;
}
declare type ResidentialList = SingleResidential[];
export declare const getPrefectures: () => Promise<PrefectureList>;
export declare const cachePrefectures: (data: PrefectureList) => PrefectureList;
export declare const getPrefectureRegexPatterns: (prefs: string[]) => [string, string][];
export declare const getCityRegexPatterns: (pref: string, cities: string[]) => [string, string][];
export declare const getTowns: (pref: string, city: string) => Promise<TownList>;
export declare const getGaikuList: (pref: string, city: string, town: string) => Promise<GaikuListItem[]>;
export declare const getResidentials: (pref: string, city: string, town: string) => Promise<ResidentialList>;
export declare const getTownRegexPatterns: (pref: string, city: string) => Promise<[SingleTown, string][]>;
export declare const getSameNamedPrefectureCityRegexPatterns: (prefs: string[], prefList: PrefectureList) => [string, string][];
export {};
