"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
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
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalize = void 0;
var os_1 = __importDefault(require("os"));
var path_1 = __importDefault(require("path"));
var japanese_numeral_1 = require("@geolonia/japanese-numeral");
var tmpdir = path_1.default.join(os_1.default.tmpdir(), 'normalize-japanese-addresses');
var fetch = require('node-fetch-cache')(tmpdir);
var dict_1 = __importDefault(require("./lib/dict"));
var endpoint = 'https://cdn.geolonia.com/address/japan';
var kan2num = function (string) {
    var kanjiNumbers = japanese_numeral_1.findKanjiNumbers(string);
    for (var i = 0; i < kanjiNumbers.length; i++) {
        // @ts-ignore
        string = string.replace(kanjiNumbers[i], japanese_numeral_1.kanji2number(kanjiNumbers[i]));
    }
    return string;
};
var zen2han = function (str) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９ー−]/g, function (s) {
        if ('ー' === s || '−' === s) {
            return '-';
        }
        else {
            return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
        }
    });
};
exports.normalize = function (address) { return __awaiter(void 0, void 0, void 0, function () {
    var addr, responsePrefs, prefectures, prefs, pref, i, _pref, reg, cities, city, i, _city, responseTowns, towns, units, town, i, reg, _town, regex, match;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                addr = dict_1.default(zen2han(address));
                return [4 /*yield*/, fetch(endpoint + ".json")];
            case 1:
                responsePrefs = _a.sent();
                return [4 /*yield*/, responsePrefs.json()];
            case 2:
                prefectures = _a.sent();
                prefs = Object.keys(prefectures);
                pref = '' // 都道府県名
                ;
                for (i = 0; i < prefs.length; i++) {
                    _pref = dict_1.default(prefs[i]).replace(/(都|道|府|県)$/, '') // `東京` の様に末尾の `都府県` が抜けた住所に対応
                    ;
                    reg = new RegExp("^" + _pref + "(\u90FD|\u9053|\u5E9C|\u770C)");
                    if (addr.match(reg)) {
                        pref = prefs[i];
                        addr = addr.replace(reg, ''); // 都道府県名以降の住所
                        break;
                    }
                }
                if (!pref) {
                    throw new Error("Can't detect the prefecture.");
                }
                cities = prefectures[pref];
                // 少ない文字数の地名に対してミスマッチしないように文字の長さ順にソート
                cities.sort(function (a, b) {
                    return b.length - a.length;
                });
                city = '' // 市区町村名
                ;
                for (i = 0; i < cities.length; i++) {
                    if (0 === addr.indexOf(dict_1.default(cities[i]))) {
                        city = cities[i];
                        addr = addr.substring(cities[i].length); // 市区町村名以降の住所
                        break;
                    }
                    else {
                        // 以下 `xxx郡` が省略されているケースに対する対応
                        if (0 < cities[i].indexOf('郡')) {
                            _city = cities[i].replace(/.+郡/, '');
                            if (0 === addr.indexOf(dict_1.default(_city))) {
                                city = cities[i];
                                addr = addr.substring(_city.length); // 市区町村名以降の住所
                                break;
                            }
                        }
                    }
                }
                if (!city) {
                    throw new Error("Can't detect the city.");
                }
                return [4 /*yield*/, fetch(endpoint + "/" + encodeURI(pref) + "/" + encodeURI(city) + ".json")];
            case 3:
                responseTowns = _a.sent();
                return [4 /*yield*/, responseTowns.json()
                    // 少ない文字数の地名に対してミスマッチしないように文字の長さ順にソート
                ];
            case 4:
                towns = _a.sent();
                // 少ない文字数の地名に対してミスマッチしないように文字の長さ順にソート
                towns.sort(function (a, b) {
                    return b.length - a.length;
                });
                addr = kan2num(addr).replace(/の([0-9]+)/g, function (s) {
                    return s.replace('の', '-');
                });
                units = '(丁目|丁|番町|条|軒|線|の町|号|地割|-)';
                town = '';
                for (i = 0; i < towns.length; i++) {
                    reg = new RegExp("[\u3007\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D\u5341\u767E\u5343]+" + units, 'g');
                    _town = dict_1.default(towns[i]).replace(reg, function (s) {
                        return kan2num(s); // API からのレスポンスに含まれる `n丁目` 等の `n` を数字に変換する。
                    });
                    regex = new RegExp(_town.replace(/([0-9]+)(丁目|丁|番町|条|軒|線|の町|号|地割|-)/ig, "$1" + units));
                    match = addr.match(regex);
                    if (match) {
                        town = kan2num(towns[i]);
                        addr = addr.substring(addr.lastIndexOf(match[0]) + match[0].length); // 町丁目以降の住所
                        break;
                    }
                }
                // 町名部分に対する例外的な処理
                town = town.replace(/([0-9])軒町/, function (s, p1) {
                    return japanese_numeral_1.number2kanji(parseInt(p1)) + "\u8ED2\u753A"; // 京都などに存在する `七軒町` などの地名の数字を漢数字に戻す
                });
                if (!town) {
                    throw new Error("Can't detect the town.");
                }
                addr = addr.replace(/([(0-9]+)番([0-9]+)号/, '$1-$2')
                    .replace(/([0-9]+)番地/, '$1');
                return [2 /*return*/, pref + city + town + addr];
        }
    });
}); };
