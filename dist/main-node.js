'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var japaneseNumeral = require('@geolonia/japanese-numeral');
var LRU = require('lru-cache');
var unfetch = require('isomorphic-unfetch');
var fs = require('fs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var LRU__default = /*#__PURE__*/_interopDefaultLegacy(LRU);
var unfetch__default = /*#__PURE__*/_interopDefaultLegacy(unfetch);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var gh_pages_endpoint = 'https://geolonia.github.io/japanese-addresses/api/ja';
var currentConfig = {
    japaneseAddressesApi: gh_pages_endpoint,
    townCacheSize: 1000,
};

var kan2num = function (string) {
    var kanjiNumbers = japaneseNumeral.findKanjiNumbers(string);
    for (var i = 0; i < kanjiNumbers.length; i++) {
        // @ts-ignore
        string = string.replace(kanjiNumbers[i], japaneseNumeral.kanji2number(kanjiNumbers[i]));
    }
    return string;
};

var zen2han = function (str) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    });
};

var addrPatches = [
    {
        pref: '香川県',
        city: '仲多度郡まんのう町',
        town: '勝浦',
        pattern: '^字?家6',
        result: '家六',
    },
    {
        pref: '愛知県',
        city: 'あま市',
        town: '西今宿',
        pattern: '^字?梶村1',
        result: '梶村一',
    },
    {
        pref: '香川県',
        city: '丸亀市',
        town: '原田町',
        pattern: '^字?東三分1',
        result: '東三分一',
    },
];
var patchAddr = function (pref, city, town, addr) {
    var _addr = addr;
    for (var i = 0; i < addrPatches.length; i++) {
        var patch = addrPatches[i];
        if (patch.pref === pref && patch.city === city && patch.town === town) {
            _addr = _addr.replace(new RegExp(patch.pattern), patch.result);
        }
    }
    return _addr;
};

// JIS 第2水準 => 第1水準 及び 旧字体 => 新字体
var JIS_OLD_KANJI = '亞,圍,壹,榮,驛,應,櫻,假,會,懷,覺,樂,陷,歡,氣,戲,據,挾,區,徑,溪,輕,藝,儉,圈,權,嚴,恆,國,齋,雜,蠶,殘,兒,實,釋,從,縱,敍,燒,條,剩,壤,釀,眞,盡,醉,髓,聲,竊,淺,錢,禪,爭,插,騷,屬,對,滯,擇,單,斷,癡,鑄,敕,鐵,傳,黨,鬪,屆,腦,廢,發,蠻,拂,邊,瓣,寶,沒,滿,藥,餘,樣,亂,兩,禮,靈,爐,灣,惡,醫,飮,營,圓,歐,奧,價,繪,擴,學,罐,勸,觀,歸,犧,擧,狹,驅,莖,經,繼,缺,劍,檢,顯,廣,鑛,碎,劑,參,慘,絲,辭,舍,壽,澁,肅,將,證,乘,疊,孃,觸,寢,圖,穗,樞,齊,攝,戰,潛,雙,莊,裝,藏,續,體,臺,澤,膽,彈,蟲,廳,鎭,點,燈,盜,獨,貳,霸,賣,髮,祕,佛,變,辯,豐,飜,默,與,譽,謠,覽,獵,勵,齡,勞,壓,爲,隱,衞,鹽,毆,穩,畫,壞,殼,嶽,卷,關,顏,僞,舊,峽,曉,勳,惠,螢,鷄,縣,險,獻,驗,效,號,濟,册,棧,贊,齒,濕,寫,收,獸,處,稱,奬,淨,繩,讓,囑,愼,粹,隨,數,靜,專,踐,纖,壯,搜,總,臟,墮,帶,瀧,擔,團,遲,晝,聽,遞,轉,當,稻,讀,惱,拜,麥,拔,濱,竝,辨,舖,襃,萬,譯,豫,搖,來,龍,壘,隸,戀,樓,鰺,鶯,蠣,攪,竈,灌,諫,頸,礦,蘂,靱,賤,壺,礪,檮,濤,邇,蠅,檜,儘,藪,籠,彌,麩'.split(/,/);
var JIS_NEW_KANJI = '亜,囲,壱,栄,駅,応,桜,仮,会,懐,覚,楽,陥,歓,気,戯,拠,挟,区,径,渓,軽,芸,倹,圏,権,厳,恒,国,斎,雑,蚕,残,児,実,釈,従,縦,叙,焼,条,剰,壌,醸,真,尽,酔,髄,声,窃,浅,銭,禅,争,挿,騒,属,対,滞,択,単,断,痴,鋳,勅,鉄,伝,党,闘,届,脳,廃,発,蛮,払,辺,弁,宝,没,満,薬,余,様,乱,両,礼,霊,炉,湾,悪,医,飲,営,円,欧,奥,価,絵,拡,学,缶,勧,観,帰,犠,挙,狭,駆,茎,経,継,欠,剣,検,顕,広,鉱,砕,剤,参,惨,糸,辞,舎,寿,渋,粛,将,証,乗,畳,嬢,触,寝,図,穂,枢,斉,摂,戦,潜,双,荘,装,蔵,続,体,台,沢,胆,弾,虫,庁,鎮,点,灯,盗,独,弐,覇,売,髪,秘,仏,変,弁,豊,翻,黙,与,誉,謡,覧,猟,励,齢,労,圧,為,隠,衛,塩,殴,穏,画,壊,殻,岳,巻,関,顔,偽,旧,峡,暁,勲,恵,蛍,鶏,県,険,献,験,効,号,済,冊,桟,賛,歯,湿,写,収,獣,処,称,奨,浄,縄,譲,嘱,慎,粋,随,数,静,専,践,繊,壮,捜,総,臓,堕,帯,滝,担,団,遅,昼,聴,逓,転,当,稲,読,悩,拝,麦,抜,浜,並,弁,舗,褒,万,訳,予,揺,来,竜,塁,隷,恋,楼,鯵,鴬,蛎,撹,竃,潅,諌,頚,砿,蕊,靭,賎,壷,砺,梼,涛,迩,蝿,桧,侭,薮,篭,弥,麸'.split(/,/);
var JIS_KANJI_REGEX_PATTERNS = JIS_OLD_KANJI.map(function (old, i) {
    var pattern = old + "|" + JIS_NEW_KANJI[i];
    return [pattern, old, JIS_NEW_KANJI[i]];
});
var jisKanji = function (str) {
    var _str = str;
    for (var i = 0; i < JIS_KANJI_REGEX_PATTERNS.length; i++) {
        var _a = JIS_KANJI_REGEX_PATTERNS[i], pattern = _a[0], oldKanji = _a[1], newKanji = _a[2];
        _str = _str.replace(new RegExp(pattern, 'g'), "(" + oldKanji + "|" + newKanji + ")");
    }
    return _str;
};
var toRegexPattern = function (string) {
    var _str = string;
    // 以下なるべく文字数が多いものほど上にすること
    _str = _str
        .replace(/三栄町|四谷三栄町/g, '(三栄町|四谷三栄町)')
        .replace(/鬮野川|くじ野川|くじの川/g, '(鬮野川|くじ野川|くじの川)')
        .replace(/通り|とおり/g, '(通り|とおり)')
        .replace(/埠頭|ふ頭/g, '(埠頭|ふ頭)')
        .replace(/番町|番丁/g, '(番町|番丁)')
        .replace(/大冝|大宜/g, '(大冝|大宜)')
        .replace(/穝|さい/g, '(穝|さい)')
        .replace(/杁|えぶり/g, '(杁|えぶり)')
        .replace(/薭|稗|ひえ|ヒエ/g, '(薭|稗|ひえ|ヒエ)')
        .replace(/[之ノの]/g, '[之ノの]')
        .replace(/[ヶケが]/g, '[ヶケが]')
        .replace(/[ヵカか力]/g, '[ヵカか力]')
        .replace(/[ッツっつ]/g, '[ッツっつ]')
        .replace(/[ニ二]/g, '[ニ二]')
        .replace(/[ハ八]/g, '[ハ八]')
        .replace(/塚|塚/g, '(塚|塚)')
        .replace(/釜|竈/g, '(釜|竈)')
        .replace(/條|条/g, '(條|条)')
        .replace(/狛|拍/g, '(狛|拍)')
        .replace(/藪|薮/g, '(藪|薮)')
        .replace(/渕|淵/g, '(渕|淵)')
        .replace(/エ|ヱ|え/g, '(エ|ヱ|え)')
        .replace(/曾|曽/g, '(曾|曽)')
        .replace(/舟|船/g, '(舟|船)')
        .replace(/莵|菟/g, '(莵|菟)')
        .replace(/市|巿/g, '(市|巿)');
    _str = jisKanji(_str);
    return _str;
};

var cachedTownRegexes = new LRU__default['default']({
    max: currentConfig.townCacheSize,
    maxAge: 60 * 60 * 24 * 7 * 1000, // 7日間
});
var cachedPrefecturePatterns = undefined;
var cachedCityPatterns = {};
var cachedPrefectures = undefined;
var cachedTowns = {};
var cachedGaikuListItem = {};
var cachedResidentials = {};
var cachedSameNamedPrefectureCityRegexPatterns = undefined;
var getPrefectures = function () { return __awaiter(void 0, void 0, void 0, function () {
    var prefsResp, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (typeof cachedPrefectures !== 'undefined') {
                    return [2 /*return*/, cachedPrefectures];
                }
                return [4 /*yield*/, __internals.fetch('.json')]; // ja.json
            case 1:
                prefsResp = _a.sent() // ja.json
                ;
                return [4 /*yield*/, prefsResp.json()];
            case 2:
                data = (_a.sent());
                return [2 /*return*/, cachePrefectures(data)];
        }
    });
}); };
var cachePrefectures = function (data) {
    return (cachedPrefectures = data);
};
var getPrefectureRegexPatterns = function (prefs) {
    if (cachedPrefecturePatterns) {
        return cachedPrefecturePatterns;
    }
    cachedPrefecturePatterns = prefs.map(function (pref) {
        var _pref = pref.replace(/(都|道|府|県)$/, ''); // `東京` の様に末尾の `都府県` が抜けた住所に対応
        var pattern = "^" + _pref + "(\u90FD|\u9053|\u5E9C|\u770C)?";
        return [pref, pattern];
    });
    return cachedPrefecturePatterns;
};
var getCityRegexPatterns = function (pref, cities) {
    var cachedResult = cachedCityPatterns[pref];
    if (typeof cachedResult !== 'undefined') {
        return cachedResult;
    }
    // 少ない文字数の地名に対してミスマッチしないように文字の長さ順にソート
    cities.sort(function (a, b) {
        return b.length - a.length;
    });
    var patterns = cities.map(function (city) {
        var pattern = "^" + toRegexPattern(city);
        if (city.match(/(町|村)$/)) {
            pattern = "^" + toRegexPattern(city).replace(/(.+?)郡/, '($1郡)?'); // 郡が省略されてるかも
        }
        return [city, pattern];
    });
    cachedCityPatterns[pref] = patterns;
    return patterns;
};
var getTowns = function (pref, city) { return __awaiter(void 0, void 0, void 0, function () {
    var cacheKey, cachedTown, townsResp, towns;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cacheKey = pref + "-" + city;
                cachedTown = cachedTowns[cacheKey];
                if (typeof cachedTown !== 'undefined') {
                    return [2 /*return*/, cachedTown];
                }
                return [4 /*yield*/, __internals.fetch(['', encodeURI(pref), encodeURI(city) + '.json'].join('/'))];
            case 1:
                townsResp = _a.sent();
                return [4 /*yield*/, townsResp.json()];
            case 2:
                towns = (_a.sent());
                return [2 /*return*/, (cachedTowns[cacheKey] = towns)];
        }
    });
}); };
var getGaikuList = function (pref, city, town) { return __awaiter(void 0, void 0, void 0, function () {
    var cacheKey, cache, gaikuResp, gaikuListItem;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                cacheKey = pref + "-" + city + "-" + town;
                cache = cachedGaikuListItem[cacheKey];
                if (typeof cache !== 'undefined') {
                    return [2 /*return*/, cache];
                }
                return [4 /*yield*/, __internals.fetch(['', encodeURI(pref), encodeURI(city), encodeURI(town + '.json')].join('/'))];
            case 1:
                gaikuResp = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                return [4 /*yield*/, gaikuResp.json()];
            case 3:
                gaikuListItem = (_b.sent());
                return [3 /*break*/, 5];
            case 4:
                _b.sent();
                gaikuListItem = [];
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/, (cachedGaikuListItem[cacheKey] = gaikuListItem)];
        }
    });
}); };
var getResidentials = function (pref, city, town) { return __awaiter(void 0, void 0, void 0, function () {
    var cacheKey, cache, residentialsResp, residentials;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                cacheKey = pref + "-" + city + "-" + town;
                cache = cachedResidentials[cacheKey];
                if (typeof cache !== 'undefined') {
                    return [2 /*return*/, cache];
                }
                return [4 /*yield*/, __internals.fetch([
                        '',
                        encodeURI(pref),
                        encodeURI(city),
                        encodeURI(town),
                        encodeURI('住居表示.json'),
                    ].join('/'))];
            case 1:
                residentialsResp = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                return [4 /*yield*/, residentialsResp.json()];
            case 3:
                residentials = (_b.sent());
                return [3 /*break*/, 5];
            case 4:
                _b.sent();
                residentials = [];
                return [3 /*break*/, 5];
            case 5:
                residentials.sort(function (res1, res2) {
                    return (res2.gaiku + "-" + res2.jyukyo).length -
                        (res1.gaiku + "-" + res1.jyukyo).length;
                });
                return [2 /*return*/, (cachedResidentials[cacheKey] = residentials)];
        }
    });
}); };
// 十六町 のように漢数字と町が連結しているか
var isKanjiNumberFollewedByCho = function (targetTownName) {
    var xCho = targetTownName.match(/.町/g);
    if (!xCho)
        return false;
    var kanjiNumbers = japaneseNumeral.findKanjiNumbers(xCho[0]);
    return kanjiNumbers.length > 0;
};
var getTownRegexPatterns = function (pref, city) { return __awaiter(void 0, void 0, void 0, function () {
    var cachedResult, pre_towns, townSet, towns, isKyoto, _i, pre_towns_1, town, originalTown, townAbbr, patterns;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cachedResult = cachedTownRegexes.get(pref + "-" + city);
                if (typeof cachedResult !== 'undefined') {
                    return [2 /*return*/, cachedResult];
                }
                return [4 /*yield*/, getTowns(pref, city)];
            case 1:
                pre_towns = _a.sent();
                townSet = new Set(pre_towns.map(function (town) { return town.town; }));
                towns = [];
                isKyoto = city.match(/^京都市/);
                // 町丁目に「○○町」が含まれるケースへの対応
                // 通常は「○○町」のうち「町」の省略を許容し同義語として扱うが、まれに自治体内に「○○町」と「○○」が共存しているケースがある。
                // この場合は町の省略は許容せず、入力された住所は書き分けられているものとして正規化を行う。
                // 更に、「愛知県名古屋市瑞穂区十六町1丁目」漢数字を含むケースだと丁目や番地・号の正規化が不可能になる。このようなケースも除外。
                for (_i = 0, pre_towns_1 = pre_towns; _i < pre_towns_1.length; _i++) {
                    town = pre_towns_1[_i];
                    towns.push(town);
                    originalTown = town.town;
                    if (originalTown.indexOf('町') === -1)
                        continue;
                    townAbbr = originalTown.replace(/(?!^町)町/g, '') // NOTE: 冒頭の「町」は明らかに省略するべきではないので、除外
                    ;
                    if (!isKyoto && // 京都は通り名削除の処理があるため、意図しないマッチになるケースがある。これを除く
                        !townSet.has(townAbbr) &&
                        !townSet.has("\u5927\u5B57" + townAbbr) && // 大字は省略されるため、大字〇〇と〇〇町がコンフリクトする。このケースを除外
                        !isKanjiNumberFollewedByCho(originalTown)) {
                        // エイリアスとして町なしのパターンを登録
                        towns.push(__assign(__assign({}, town), { originalTown: originalTown, town: townAbbr }));
                    }
                }
                // 少ない文字数の地名に対してミスマッチしないように文字の長さ順にソート
                towns.sort(function (a, b) {
                    var aLen = a.town.length;
                    var bLen = b.town.length;
                    // 大字で始まる場合、優先度を低く設定する。
                    // 大字XX と XXYY が存在するケースもあるので、 XXYY を先にマッチしたい
                    if (a.town.startsWith('大字'))
                        aLen -= 2;
                    if (b.town.startsWith('大字'))
                        bLen -= 2;
                    return bLen - aLen;
                });
                patterns = towns.map(function (town) {
                    var pattern = toRegexPattern(town.town
                        // 横棒を含む場合（流通センター、など）に対応
                        .replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, '[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]')
                        .replace(/大?字/g, '(大?字)?')
                        // 以下住所マスターの町丁目に含まれる数字を正規表現に変換する
                        .replace(/([壱一二三四五六七八九十]+)(丁目?|番(町|丁)|条|軒|線|(の|ノ)町|地割|号)/g, function (match) {
                        var patterns = [];
                        patterns.push(match
                            .toString()
                            .replace(/(丁目?|番(町|丁)|条|軒|線|(の|ノ)町|地割|号)/, '')); // 漢数字
                        if (match.match(/^壱/)) {
                            patterns.push('一');
                            patterns.push('1');
                            patterns.push('１');
                        }
                        else {
                            var num = match
                                .replace(/([一二三四五六七八九十]+)/g, function (match) {
                                return kan2num(match);
                            })
                                .replace(/(丁目?|番(町|丁)|条|軒|線|(の|ノ)町|地割|号)/, '');
                            patterns.push(num.toString()); // 半角アラビア数字
                        }
                        // 以下の正規表現は、上のよく似た正規表現とは違うことに注意！
                        var _pattern = "(" + patterns.join('|') + ")((\u4E01|\u753A)\u76EE?|\u756A(\u753A|\u4E01)|\u6761|\u8ED2|\u7DDA|\u306E\u753A?|\u5730\u5272|\u53F7|[-\uFF0D\uFE63\u2212\u2010\u2043\u2011\u2012\u2013\u2014\uFE58\u2015\u23AF\u23E4\u30FC\uFF70\u2500\u2501])";
                        return _pattern; // デバッグのときにめんどくさいので変数に入れる。
                    }));
                    return [town, pattern];
                });
                cachedTownRegexes.set(pref + "-" + city, patterns);
                return [2 /*return*/, patterns];
        }
    });
}); };
var getSameNamedPrefectureCityRegexPatterns = function (prefs, prefList) {
    if (typeof cachedSameNamedPrefectureCityRegexPatterns !== 'undefined') {
        return cachedSameNamedPrefectureCityRegexPatterns;
    }
    var _prefs = prefs.map(function (pref) {
        return pref.replace(/[都|道|府|県]$/, '');
    });
    cachedSameNamedPrefectureCityRegexPatterns = [];
    for (var pref in prefList) {
        for (var i = 0; i < prefList[pref].length; i++) {
            var city = prefList[pref][i];
            // 「福島県石川郡石川町」のように、市の名前が別の都道府県名から始まっているケースも考慮する。
            for (var j = 0; j < _prefs.length; j++) {
                if (city.indexOf(_prefs[j]) === 0) {
                    cachedSameNamedPrefectureCityRegexPatterns.push([
                        "" + pref + city,
                        "^" + city,
                    ]);
                }
            }
        }
    }
    return cachedSameNamedPrefectureCityRegexPatterns;
};

var config$1 = currentConfig;
var defaultOption = {
    level: 3,
};
/**
 * @internal
 */
var __internals = {
    // default fetch
    fetch: function (input) {
        var url = new URL("" + config$1.japaneseAddressesApi + input).toString();
        if (config$1.geoloniaApiKey) {
            url += "?geolonia-api-key=" + config$1.geoloniaApiKey;
        }
        return unfetch__default['default'](url);
    },
};
var normalizeTownName = function (addr, pref, city) { return __awaiter(void 0, void 0, void 0, function () {
    var townPatterns, regexPrefixes, _i, regexPrefixes_1, regexPrefix, _a, townPatterns_1, _b, town, pattern, regex, match;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                addr = addr.trim().replace(/^大字/, '');
                return [4 /*yield*/, getTownRegexPatterns(pref, city)];
            case 1:
                townPatterns = _c.sent();
                regexPrefixes = ['^'];
                if (city.match(/^京都市/)) {
                    // 京都は通り名削除のために後方一致を使う
                    regexPrefixes.push('.*');
                }
                for (_i = 0, regexPrefixes_1 = regexPrefixes; _i < regexPrefixes_1.length; _i++) {
                    regexPrefix = regexPrefixes_1[_i];
                    for (_a = 0, townPatterns_1 = townPatterns; _a < townPatterns_1.length; _a++) {
                        _b = townPatterns_1[_a], town = _b[0], pattern = _b[1];
                        regex = new RegExp("" + regexPrefix + pattern);
                        match = addr.match(regex);
                        if (match) {
                            return [2 /*return*/, {
                                    town: town.originalTown || town.town,
                                    addr: addr.substr(match[0].length),
                                    lat: town.lat,
                                    lng: town.lng,
                                }];
                        }
                    }
                }
                return [2 /*return*/];
        }
    });
}); };
var normalizeResidentialPart = function (addr, pref, city, town) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, gaikuListItem, residentials, match, gaiku_1, jyukyo, jyukyohyoji_1, residential, addr2, gaikuItem, addr2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, Promise.all([
                    getGaikuList(pref, city, town),
                    getResidentials(pref, city, town),
                ])
                // 住居表示未整備
            ];
            case 1:
                _a = _b.sent(), gaikuListItem = _a[0], residentials = _a[1];
                // 住居表示未整備
                if (gaikuListItem.length === 0) {
                    return [2 /*return*/, null];
                }
                match = addr.match(/^([1-9][0-9]*)-([1-9][0-9]*)/);
                if (match) {
                    gaiku_1 = match[1];
                    jyukyo = match[2];
                    jyukyohyoji_1 = gaiku_1 + "-" + jyukyo;
                    residential = residentials.find(function (res) { return res.gaiku + "-" + res.jyukyo === jyukyohyoji_1; });
                    if (residential) {
                        addr2 = addr.replace(jyukyohyoji_1, '').trim();
                        return [2 /*return*/, {
                                gaiku: gaiku_1,
                                jyukyo: jyukyo,
                                addr: addr2,
                                lat: residential.lat,
                                lng: residential.lng,
                            }];
                    }
                    gaikuItem = gaikuListItem.find(function (item) { return item.gaiku === gaiku_1; });
                    if (gaikuItem) {
                        addr2 = addr.replace(gaikuItem.gaiku, '').trim();
                        return [2 /*return*/, { gaiku: gaiku_1, addr: addr2, lat: gaikuItem.lat, lng: gaikuItem.lng }];
                    }
                }
                return [2 /*return*/, null];
        }
    });
}); };
var normalize$1 = function (address, _option) {
    if (_option === void 0) { _option = defaultOption; }
    return __awaiter(void 0, void 0, void 0, function () {
        var option, addr, pref, city, town, lat, lng, level, normalized, prefectures, prefs, prefPatterns, sameNamedPrefectureCityRegexPatterns, i, _a, prefectureCity, reg, match, i, _b, _pref, pattern, match, matched, _pref, cities, cityPatterns, i, _c, _city, pattern, match, i, normalized_1, cities, cityPatterns, i, _d, _city, pattern, match, result;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    option = __assign(__assign({}, defaultOption), _option);
                    if (option.geoloniaApiKey || config$1.geoloniaApiKey) {
                        option.level = 8;
                        option.geoloniaApiKey && (config$1.geoloniaApiKey = option.geoloniaApiKey);
                        // API キーがある場合は、 Geolonia SaaS に切り替え。
                        // ただし、config を書き換えて別のエンドポイントを使うようにカスタマイズしているケースがあるので、その場合は config に既に入っている値を優先
                        if (config$1.japaneseAddressesApi === gh_pages_endpoint) {
                            config$1.japaneseAddressesApi =
                                'https://japanese-addresses.geolonia.com/next/ja';
                        }
                    }
                    addr = address
                        .normalize('NFC')
                        .replace(/　/g, ' ')
                        .replace(/ +/g, ' ')
                        .replace(/([０-９Ａ-Ｚａ-ｚ]+)/g, function (match) {
                        // 全角のアラビア数字は問答無用で半角にする
                        return zen2han(match);
                    })
                        // 数字の後または数字の前にくる横棒はハイフンに統一する
                        .replace(/([0-9０-９一二三四五六七八九〇十百千][-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━])|([-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━])[0-9０-９一二三四五六七八九〇十]/g, function (match) {
                        return match.replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, '-');
                    })
                        .replace(/(.+)(丁目?|番(町|地|丁)|条|軒|線|(の|ノ)町|地割)/, function (match) {
                        return match.replace(/ /g, ''); // 町丁目名以前のスペースはすべて削除
                    })
                        .replace(/(.+)((郡.+(町|村))|((市|巿).+(区|區)))/, function (match) {
                        return match.replace(/ /g, ''); // 区、郡以前のスペースはすべて削除
                    })
                        .replace(/.+?[0-9一二三四五六七八九〇十百千]-/, function (match) {
                        return match.replace(/ /g, ''); // 1番はじめに出てくるアラビア数字以前のスペースを削除
                    });
                    pref = '';
                    city = '';
                    town = '';
                    lat = null;
                    lng = null;
                    level = 0;
                    normalized = null;
                    return [4 /*yield*/, getPrefectures()];
                case 1:
                    prefectures = _e.sent();
                    prefs = Object.keys(prefectures);
                    prefPatterns = getPrefectureRegexPatterns(prefs);
                    sameNamedPrefectureCityRegexPatterns = getSameNamedPrefectureCityRegexPatterns(prefs, prefectures);
                    // 県名が省略されており、かつ市の名前がどこかの都道府県名と同じ場合(例.千葉県千葉市)、
                    // あらかじめ県名を補完しておく。
                    for (i = 0; i < sameNamedPrefectureCityRegexPatterns.length; i++) {
                        _a = sameNamedPrefectureCityRegexPatterns[i], prefectureCity = _a[0], reg = _a[1];
                        match = addr.match(reg);
                        if (match) {
                            addr = addr.replace(new RegExp(reg), prefectureCity);
                            break;
                        }
                    }
                    for (i = 0; i < prefPatterns.length; i++) {
                        _b = prefPatterns[i], _pref = _b[0], pattern = _b[1];
                        match = addr.match(pattern);
                        if (match) {
                            pref = _pref;
                            addr = addr.substring(match[0].length); // 都道府県名以降の住所
                            break;
                        }
                    }
                    if (!!pref) return [3 /*break*/, 6];
                    matched = [];
                    for (_pref in prefectures) {
                        cities = prefectures[_pref];
                        cityPatterns = getCityRegexPatterns(_pref, cities);
                        addr = addr.trim();
                        for (i = 0; i < cityPatterns.length; i++) {
                            _c = cityPatterns[i], _city = _c[0], pattern = _c[1];
                            match = addr.match(pattern);
                            if (match) {
                                matched.push({
                                    pref: _pref,
                                    city: _city,
                                    addr: addr.substring(match[0].length),
                                });
                            }
                        }
                    }
                    if (!(1 === matched.length)) return [3 /*break*/, 2];
                    pref = matched[0].pref;
                    return [3 /*break*/, 6];
                case 2:
                    i = 0;
                    _e.label = 3;
                case 3:
                    if (!(i < matched.length)) return [3 /*break*/, 6];
                    return [4 /*yield*/, normalizeTownName(matched[i].addr, matched[i].pref, matched[i].city)];
                case 4:
                    normalized_1 = _e.sent();
                    if (normalized_1) {
                        pref = matched[i].pref;
                    }
                    _e.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6:
                    if (pref && option.level >= 2) {
                        cities = prefectures[pref];
                        cityPatterns = getCityRegexPatterns(pref, cities);
                        addr = addr.trim();
                        for (i = 0; i < cityPatterns.length; i++) {
                            _d = cityPatterns[i], _city = _d[0], pattern = _d[1];
                            match = addr.match(pattern);
                            if (match) {
                                city = _city;
                                addr = addr.substring(match[0].length); // 市区町村名以降の住所
                                break;
                            }
                        }
                    }
                    if (!(city && option.level >= 3)) return [3 /*break*/, 8];
                    return [4 /*yield*/, normalizeTownName(addr, pref, city)];
                case 7:
                    normalized = _e.sent();
                    if (normalized) {
                        town = normalized.town;
                        addr = normalized.addr;
                        lat = parseFloat(normalized.lat);
                        lng = parseFloat(normalized.lng);
                        if (Number.isNaN(lat) || Number.isNaN(lng)) {
                            lat = null;
                            lng = null;
                        }
                    }
                    // townが取得できた場合にのみ、addrに対する各種の変換処理を行う。
                    if (town) {
                        addr = addr
                            .replace(/^-/, '')
                            .replace(/([0-9]+)(丁目)/g, function (match) {
                            return match.replace(/([0-9]+)/g, function (num) {
                                return japaneseNumeral.number2kanji(Number(num));
                            });
                        })
                            .replace(/(([0-9〇一二三四五六七八九十百千]+)(番地?)([0-9〇一二三四五六七八九十百千]+)号)\s*(.+)/, '$1 $5')
                            .replace(/([0-9〇一二三四五六七八九十百千]+)\s*(番地?)\s*([0-9〇一二三四五六七八九十百千]+)\s*号?/, '$1-$3')
                            .replace(/([0-9〇一二三四五六七八九十百千]+)番地?/, '$1')
                            .replace(/([0-9〇一二三四五六七八九十百千]+)の/g, '$1-')
                            .replace(/([0-9〇一二三四五六七八九十百千]+)[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, function (match) {
                            return kan2num(match).replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, '-');
                        })
                            .replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]([0-9〇一二三四五六七八九十百千]+)/g, function (match) {
                            return kan2num(match).replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, '-');
                        })
                            .replace(/([0-9〇一二三四五六七八九十百千]+)-/, function (s) {
                            // `1-` のようなケース
                            return kan2num(s);
                        })
                            .replace(/-([0-9〇一二三四五六七八九十百千]+)/, function (s) {
                            // `-1` のようなケース
                            return kan2num(s);
                        })
                            .replace(/-[^0-9]+([0-9〇一二三四五六七八九十百千]+)/, function (s) {
                            // `-あ1` のようなケース
                            return kan2num(zen2han(s));
                        })
                            .replace(/([0-9〇一二三四五六七八九十百千]+)$/, function (s) {
                            // `串本町串本１２３４` のようなケース
                            return kan2num(s);
                        })
                            .trim();
                    }
                    _e.label = 8;
                case 8:
                    addr = patchAddr(pref, city, town, addr);
                    if (!(option.level > 3 && normalized && town)) return [3 /*break*/, 10];
                    return [4 /*yield*/, normalizeResidentialPart(addr, pref, city, town)];
                case 9:
                    normalized = _e.sent();
                    _e.label = 10;
                case 10:
                    if (normalized) {
                        lat = parseFloat(normalized.lat);
                        lng = parseFloat(normalized.lng);
                    }
                    if (Number.isNaN(lat) || Number.isNaN(lng)) {
                        lat = null;
                        lng = null;
                    }
                    if (pref)
                        level = level + 1;
                    if (city)
                        level = level + 1;
                    if (town)
                        level = level + 1;
                    result = {
                        pref: pref,
                        city: city,
                        town: town,
                        addr: addr,
                        lat: lat,
                        lng: lng,
                        level: level,
                    };
                    if (normalized && 'gaiku' in normalized) {
                        result.addr = normalized.addr;
                        result.gaiku = normalized.gaiku;
                        result.level = 7;
                    }
                    if (normalized && 'jyukyo' in normalized) {
                        result.jyukyo = normalized.jyukyo;
                        result.level = 8;
                    }
                    return [2 /*return*/, result];
            }
        });
    });
};

var fetchOrReadFile = function (input) { return __awaiter(void 0, void 0, void 0, function () {
    var fileURL, filePath_1;
    return __generator(this, function (_a) {
        fileURL = new URL("" + config$1.japaneseAddressesApi + input);
        if (fileURL.protocol === 'http:' || fileURL.protocol === 'https:') {
            if (config$1.geoloniaApiKey) {
                fileURL.search = "?geolonia-api-key=" + config$1.geoloniaApiKey;
            }
            return [2 /*return*/, unfetch__default['default'](fileURL.toString())];
        }
        else if (fileURL.protocol === 'file:') {
            filePath_1 = decodeURI(fileURL.pathname);
            return [2 /*return*/, {
                    json: function () { return __awaiter(void 0, void 0, void 0, function () {
                        var contents;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fs.promises.readFile(filePath_1)];
                                case 1:
                                    contents = _a.sent();
                                    return [2 /*return*/, JSON.parse(contents.toString('utf-8'))];
                            }
                        });
                    }); },
                }];
        }
        else {
            throw new Error("Unknown URL schema: " + fileURL.protocol);
        }
    });
}); };
__internals.fetch = fetchOrReadFile;
var config = config$1;
var normalize = normalize$1;

exports.config = config;
exports.normalize = normalize;
