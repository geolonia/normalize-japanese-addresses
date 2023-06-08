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

function getAugmentedNamespace(n) {
	if (n.__esModule) return n;
	var a = Object.defineProperty({}, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

const oldJapaneseNumerics = {
    零: '〇',
    壱: '一',
    壹: '一',
    弐: '二',
    弍: '二',
    貳: '二',
    貮: '二',
    参: '三',
    參: '三',
    肆: '四',
    伍: '五',
    陸: '六',
    漆: '七',
    捌: '八',
    玖: '九',
    拾: '十',
    廿: '二十',
    陌: '百',
    佰: '百',
    阡: '千',
    仟: '千',
    萬: '万',
};
var _default$1 = oldJapaneseNumerics;

var oldJapaneseNumerics_1 = /*#__PURE__*/Object.defineProperty({
	default: _default$1
}, '__esModule', {value: true});

const japaneseNumerics = {
    〇: 0,
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    '０': 0,
    '１': 1,
    '２': 2,
    '３': 3,
    '４': 4,
    '５': 5,
    '６': 6,
    '７': 7,
    '８': 8,
    '９': 9,
};
var _default = japaneseNumerics;

var japaneseNumerics_1 = /*#__PURE__*/Object.defineProperty({
	default: _default
}, '__esModule', {value: true});

var utils = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.zen2han = exports.n2kan = exports.kan2n = exports.splitLargeNumber = exports.normalize = exports.smallNumbers = exports.largeNumbers = void 0;


exports.largeNumbers = { '兆': 1000000000000, '億': 100000000, '万': 10000 };
exports.smallNumbers = { '千': 1000, '百': 100, '十': 10 };
function normalize(japanese) {
    for (const key in oldJapaneseNumerics_1.default) {
        const reg = new RegExp(key, 'g');
        japanese = japanese.replace(reg, oldJapaneseNumerics_1.default[key]);
    }
    return japanese;
}
exports.normalize = normalize;
/**
 * 漢数字を兆、億、万単位に分割する
 */
function splitLargeNumber(japanese) {
    let kanji = japanese;
    const numbers = {};
    for (const key in exports.largeNumbers) {
        const reg = new RegExp(`(.+)${key}`);
        const match = kanji.match(reg);
        if (match) {
            numbers[key] = kan2n(match[1]);
            kanji = kanji.replace(match[0], '');
        }
        else {
            numbers[key] = 0;
        }
    }
    if (kanji) {
        numbers['千'] = kan2n(kanji);
    }
    else {
        numbers['千'] = 0;
    }
    return numbers;
}
exports.splitLargeNumber = splitLargeNumber;
/**
 * 千単位以下の漢数字を数字に変換する（例: 三千 => 3000）
 *
 * @param japanese
 */
function kan2n(japanese) {
    if (japanese.match(/^[0-9]+$/)) {
        return Number(japanese);
    }
    let kanji = zen2han(japanese);
    let number = 0;
    for (const key in exports.smallNumbers) {
        const reg = new RegExp(`(.*)${key}`);
        const match = kanji.match(reg);
        if (match) {
            let n = 1;
            if (match[1]) {
                if (match[1].match(/^[0-9]+$/)) {
                    n = Number(match[1]);
                }
                else {
                    n = japaneseNumerics_1.default[match[1]];
                }
            }
            number = number + (n * exports.smallNumbers[key]);
            kanji = kanji.replace(match[0], '');
        }
    }
    if (kanji) {
        if (kanji.match(/^[0-9]+$/)) {
            number = number + Number(kanji);
        }
        else {
            for (let index = 0; index < kanji.length; index++) {
                const char = kanji[index];
                const digit = kanji.length - index - 1;
                number = number + japaneseNumerics_1.default[char] * (10 ** digit);
            }
        }
    }
    return number;
}
exports.kan2n = kan2n;
/**
 * Converts number less than 10000 to kanji.
 *
 * @param num
 */
function n2kan(num) {
    const kanjiNumbers = Object.keys(japaneseNumerics_1.default);
    let number = num;
    let kanji = '';
    for (const key in exports.smallNumbers) {
        const n = Math.floor(number / exports.smallNumbers[key]);
        if (n) {
            number = number - (n * exports.smallNumbers[key]);
            if (1 === n) {
                kanji = `${kanji}${key}`;
            }
            else {
                kanji = `${kanji}${kanjiNumbers[n]}${key}`;
            }
        }
    }
    if (number) {
        kanji = `${kanji}${kanjiNumbers[number]}`;
    }
    return kanji;
}
exports.n2kan = n2kan;
/**
 * Converts double-width number to number as string.
 *
 * @param num
 */
function zen2han(str) {
    return str.replace(/[０-９]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
}
exports.zen2han = zen2han;
});

var dist = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.findKanjiNumbers = exports.number2kanji = exports.kanji2number = void 0;


function kanji2number(japanese) {
    japanese = utils.normalize(japanese);
    if (japanese.match('〇') || japanese.match(/^[〇一二三四五六七八九]+$/)) {
        for (const key in japaneseNumerics_1.default) {
            const reg = new RegExp(key, 'g');
            japanese = japanese.replace(reg, japaneseNumerics_1.default[key].toString());
        }
        return Number(japanese);
    }
    else {
        let number = 0;
        const numbers = utils.splitLargeNumber(japanese);
        // 万以上の数字を数値に変換
        for (const key in utils.largeNumbers) {
            if (numbers[key]) {
                const n = utils.largeNumbers[key] * numbers[key];
                number = number + n;
            }
        }
        if (!Number.isInteger(number) || !Number.isInteger(numbers['千'])) {
            throw new TypeError('The attribute of kanji2number() must be a Japanese numeral as integer.');
        }
        // 千以下の数字を足す
        return number + numbers['千'];
    }
}
exports.kanji2number = kanji2number;
function number2kanji(num) {
    if (!num.toString().match(/^[0-9]+$/)) {
        throw new TypeError('The attribute of number2kanji() must be integer.');
    }
    Object.keys(japaneseNumerics_1.default);
    let number = num;
    let kanji = '';
    // 万以上の数字を漢字に変換
    for (const key in utils.largeNumbers) {
        const n = Math.floor(number / utils.largeNumbers[key]);
        if (n) {
            number = number - (n * utils.largeNumbers[key]);
            kanji = `${kanji}${utils.n2kan(n)}${key}`;
        }
    }
    if (number) {
        kanji = `${kanji}${utils.n2kan(number)}`;
    }
    return kanji;
}
exports.number2kanji = number2kanji;
function findKanjiNumbers(text) {
    const num = '([0-9０-９]*)|([〇一二三四五六七八九壱壹弐弍貳貮参參肆伍陸漆捌玖]*)';
    const basePattern = `((${num})(千|阡|仟))?((${num})(百|陌|佰))?((${num})(十|拾))?(${num})?`;
    const pattern = `((${basePattern}兆)?(${basePattern}億)?(${basePattern}(万|萬))?${basePattern})`;
    const regex = new RegExp(pattern, 'g');
    const match = text.match(regex);
    if (match) {
        return match.filter((item) => {
            if ((!item.match(/^[0-9０-９]+$/)) && (item.length && '兆' !== item && '億' !== item && '万' !== item && '萬' !== item)) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    else {
        return [];
    }
}
exports.findKanjiNumbers = findKanjiNumbers;
});

var gh_pages_endpoint = 'https://geolonia.github.io/japanese-addresses/api/ja';
var currentConfig = {
    japaneseAddressesApi: gh_pages_endpoint,
    townCacheSize: 1000,
};

var kan2num = function (string) {
    var kanjiNumbers = dist.findKanjiNumbers(string);
    for (var i = 0; i < kanjiNumbers.length; i++) {
        // @ts-ignore
        string = string.replace(kanjiNumbers[i], dist.kanji2number(kanjiNumbers[i]));
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

var iterator = function (Yallist) {
  Yallist.prototype[Symbol.iterator] = function* () {
    for (let walker = this.head; walker; walker = walker.next) {
      yield walker.value;
    }
  };
};

var yallist = Yallist;

Yallist.Node = Node;
Yallist.create = Yallist;

function Yallist (list) {
  var self = this;
  if (!(self instanceof Yallist)) {
    self = new Yallist();
  }

  self.tail = null;
  self.head = null;
  self.length = 0;

  if (list && typeof list.forEach === 'function') {
    list.forEach(function (item) {
      self.push(item);
    });
  } else if (arguments.length > 0) {
    for (var i = 0, l = arguments.length; i < l; i++) {
      self.push(arguments[i]);
    }
  }

  return self
}

Yallist.prototype.removeNode = function (node) {
  if (node.list !== this) {
    throw new Error('removing node which does not belong to this list')
  }

  var next = node.next;
  var prev = node.prev;

  if (next) {
    next.prev = prev;
  }

  if (prev) {
    prev.next = next;
  }

  if (node === this.head) {
    this.head = next;
  }
  if (node === this.tail) {
    this.tail = prev;
  }

  node.list.length--;
  node.next = null;
  node.prev = null;
  node.list = null;

  return next
};

Yallist.prototype.unshiftNode = function (node) {
  if (node === this.head) {
    return
  }

  if (node.list) {
    node.list.removeNode(node);
  }

  var head = this.head;
  node.list = this;
  node.next = head;
  if (head) {
    head.prev = node;
  }

  this.head = node;
  if (!this.tail) {
    this.tail = node;
  }
  this.length++;
};

Yallist.prototype.pushNode = function (node) {
  if (node === this.tail) {
    return
  }

  if (node.list) {
    node.list.removeNode(node);
  }

  var tail = this.tail;
  node.list = this;
  node.prev = tail;
  if (tail) {
    tail.next = node;
  }

  this.tail = node;
  if (!this.head) {
    this.head = node;
  }
  this.length++;
};

Yallist.prototype.push = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    push(this, arguments[i]);
  }
  return this.length
};

Yallist.prototype.unshift = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    unshift(this, arguments[i]);
  }
  return this.length
};

Yallist.prototype.pop = function () {
  if (!this.tail) {
    return undefined
  }

  var res = this.tail.value;
  this.tail = this.tail.prev;
  if (this.tail) {
    this.tail.next = null;
  } else {
    this.head = null;
  }
  this.length--;
  return res
};

Yallist.prototype.shift = function () {
  if (!this.head) {
    return undefined
  }

  var res = this.head.value;
  this.head = this.head.next;
  if (this.head) {
    this.head.prev = null;
  } else {
    this.tail = null;
  }
  this.length--;
  return res
};

Yallist.prototype.forEach = function (fn, thisp) {
  thisp = thisp || this;
  for (var walker = this.head, i = 0; walker !== null; i++) {
    fn.call(thisp, walker.value, i, this);
    walker = walker.next;
  }
};

Yallist.prototype.forEachReverse = function (fn, thisp) {
  thisp = thisp || this;
  for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
    fn.call(thisp, walker.value, i, this);
    walker = walker.prev;
  }
};

Yallist.prototype.get = function (n) {
  for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.next;
  }
  if (i === n && walker !== null) {
    return walker.value
  }
};

Yallist.prototype.getReverse = function (n) {
  for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.prev;
  }
  if (i === n && walker !== null) {
    return walker.value
  }
};

Yallist.prototype.map = function (fn, thisp) {
  thisp = thisp || this;
  var res = new Yallist();
  for (var walker = this.head; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this));
    walker = walker.next;
  }
  return res
};

Yallist.prototype.mapReverse = function (fn, thisp) {
  thisp = thisp || this;
  var res = new Yallist();
  for (var walker = this.tail; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this));
    walker = walker.prev;
  }
  return res
};

Yallist.prototype.reduce = function (fn, initial) {
  var acc;
  var walker = this.head;
  if (arguments.length > 1) {
    acc = initial;
  } else if (this.head) {
    walker = this.head.next;
    acc = this.head.value;
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = 0; walker !== null; i++) {
    acc = fn(acc, walker.value, i);
    walker = walker.next;
  }

  return acc
};

Yallist.prototype.reduceReverse = function (fn, initial) {
  var acc;
  var walker = this.tail;
  if (arguments.length > 1) {
    acc = initial;
  } else if (this.tail) {
    walker = this.tail.prev;
    acc = this.tail.value;
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = this.length - 1; walker !== null; i--) {
    acc = fn(acc, walker.value, i);
    walker = walker.prev;
  }

  return acc
};

Yallist.prototype.toArray = function () {
  var arr = new Array(this.length);
  for (var i = 0, walker = this.head; walker !== null; i++) {
    arr[i] = walker.value;
    walker = walker.next;
  }
  return arr
};

Yallist.prototype.toArrayReverse = function () {
  var arr = new Array(this.length);
  for (var i = 0, walker = this.tail; walker !== null; i++) {
    arr[i] = walker.value;
    walker = walker.prev;
  }
  return arr
};

Yallist.prototype.slice = function (from, to) {
  to = to || this.length;
  if (to < 0) {
    to += this.length;
  }
  from = from || 0;
  if (from < 0) {
    from += this.length;
  }
  var ret = new Yallist();
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0;
  }
  if (to > this.length) {
    to = this.length;
  }
  for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
    walker = walker.next;
  }
  for (; walker !== null && i < to; i++, walker = walker.next) {
    ret.push(walker.value);
  }
  return ret
};

Yallist.prototype.sliceReverse = function (from, to) {
  to = to || this.length;
  if (to < 0) {
    to += this.length;
  }
  from = from || 0;
  if (from < 0) {
    from += this.length;
  }
  var ret = new Yallist();
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0;
  }
  if (to > this.length) {
    to = this.length;
  }
  for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
    walker = walker.prev;
  }
  for (; walker !== null && i > from; i--, walker = walker.prev) {
    ret.push(walker.value);
  }
  return ret
};

Yallist.prototype.splice = function (start, deleteCount, ...nodes) {
  if (start > this.length) {
    start = this.length - 1;
  }
  if (start < 0) {
    start = this.length + start;
  }

  for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
    walker = walker.next;
  }

  var ret = [];
  for (var i = 0; walker && i < deleteCount; i++) {
    ret.push(walker.value);
    walker = this.removeNode(walker);
  }
  if (walker === null) {
    walker = this.tail;
  }

  if (walker !== this.head && walker !== this.tail) {
    walker = walker.prev;
  }

  for (var i = 0; i < nodes.length; i++) {
    walker = insert(this, walker, nodes[i]);
  }
  return ret;
};

Yallist.prototype.reverse = function () {
  var head = this.head;
  var tail = this.tail;
  for (var walker = head; walker !== null; walker = walker.prev) {
    var p = walker.prev;
    walker.prev = walker.next;
    walker.next = p;
  }
  this.head = tail;
  this.tail = head;
  return this
};

function insert (self, node, value) {
  var inserted = node === self.head ?
    new Node(value, null, node, self) :
    new Node(value, node, node.next, self);

  if (inserted.next === null) {
    self.tail = inserted;
  }
  if (inserted.prev === null) {
    self.head = inserted;
  }

  self.length++;

  return inserted
}

function push (self, item) {
  self.tail = new Node(item, self.tail, null, self);
  if (!self.head) {
    self.head = self.tail;
  }
  self.length++;
}

function unshift (self, item) {
  self.head = new Node(item, null, self.head, self);
  if (!self.tail) {
    self.tail = self.head;
  }
  self.length++;
}

function Node (value, prev, next, list) {
  if (!(this instanceof Node)) {
    return new Node(value, prev, next, list)
  }

  this.list = list;
  this.value = value;

  if (prev) {
    prev.next = this;
    this.prev = prev;
  } else {
    this.prev = null;
  }

  if (next) {
    next.prev = this;
    this.next = next;
  } else {
    this.next = null;
  }
}

try {
  // add if support for Symbol.iterator is present
  iterator(Yallist);
} catch (er) {}

// A linked list to keep track of recently-used-ness


const MAX = Symbol('max');
const LENGTH = Symbol('length');
const LENGTH_CALCULATOR = Symbol('lengthCalculator');
const ALLOW_STALE = Symbol('allowStale');
const MAX_AGE = Symbol('maxAge');
const DISPOSE = Symbol('dispose');
const NO_DISPOSE_ON_SET = Symbol('noDisposeOnSet');
const LRU_LIST = Symbol('lruList');
const CACHE = Symbol('cache');
const UPDATE_AGE_ON_GET = Symbol('updateAgeOnGet');

const naiveLength = () => 1;

// lruList is a yallist where the head is the youngest
// item, and the tail is the oldest.  the list contains the Hit
// objects as the entries.
// Each Hit object has a reference to its Yallist.Node.  This
// never changes.
//
// cache is a Map (or PseudoMap) that matches the keys to
// the Yallist.Node object.
class LRUCache {
  constructor (options) {
    if (typeof options === 'number')
      options = { max: options };

    if (!options)
      options = {};

    if (options.max && (typeof options.max !== 'number' || options.max < 0))
      throw new TypeError('max must be a non-negative number')
    // Kind of weird to have a default max of Infinity, but oh well.
    this[MAX] = options.max || Infinity;

    const lc = options.length || naiveLength;
    this[LENGTH_CALCULATOR] = (typeof lc !== 'function') ? naiveLength : lc;
    this[ALLOW_STALE] = options.stale || false;
    if (options.maxAge && typeof options.maxAge !== 'number')
      throw new TypeError('maxAge must be a number')
    this[MAX_AGE] = options.maxAge || 0;
    this[DISPOSE] = options.dispose;
    this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
    this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
    this.reset();
  }

  // resize the cache when the max changes.
  set max (mL) {
    if (typeof mL !== 'number' || mL < 0)
      throw new TypeError('max must be a non-negative number')

    this[MAX] = mL || Infinity;
    trim(this);
  }
  get max () {
    return this[MAX]
  }

  set allowStale (allowStale) {
    this[ALLOW_STALE] = !!allowStale;
  }
  get allowStale () {
    return this[ALLOW_STALE]
  }

  set maxAge (mA) {
    if (typeof mA !== 'number')
      throw new TypeError('maxAge must be a non-negative number')

    this[MAX_AGE] = mA;
    trim(this);
  }
  get maxAge () {
    return this[MAX_AGE]
  }

  // resize the cache when the lengthCalculator changes.
  set lengthCalculator (lC) {
    if (typeof lC !== 'function')
      lC = naiveLength;

    if (lC !== this[LENGTH_CALCULATOR]) {
      this[LENGTH_CALCULATOR] = lC;
      this[LENGTH] = 0;
      this[LRU_LIST].forEach(hit => {
        hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
        this[LENGTH] += hit.length;
      });
    }
    trim(this);
  }
  get lengthCalculator () { return this[LENGTH_CALCULATOR] }

  get length () { return this[LENGTH] }
  get itemCount () { return this[LRU_LIST].length }

  rforEach (fn, thisp) {
    thisp = thisp || this;
    for (let walker = this[LRU_LIST].tail; walker !== null;) {
      const prev = walker.prev;
      forEachStep(this, fn, walker, thisp);
      walker = prev;
    }
  }

  forEach (fn, thisp) {
    thisp = thisp || this;
    for (let walker = this[LRU_LIST].head; walker !== null;) {
      const next = walker.next;
      forEachStep(this, fn, walker, thisp);
      walker = next;
    }
  }

  keys () {
    return this[LRU_LIST].toArray().map(k => k.key)
  }

  values () {
    return this[LRU_LIST].toArray().map(k => k.value)
  }

  reset () {
    if (this[DISPOSE] &&
        this[LRU_LIST] &&
        this[LRU_LIST].length) {
      this[LRU_LIST].forEach(hit => this[DISPOSE](hit.key, hit.value));
    }

    this[CACHE] = new Map(); // hash of items by key
    this[LRU_LIST] = new yallist(); // list of items in order of use recency
    this[LENGTH] = 0; // length of items in the list
  }

  dump () {
    return this[LRU_LIST].map(hit =>
      isStale(this, hit) ? false : {
        k: hit.key,
        v: hit.value,
        e: hit.now + (hit.maxAge || 0)
      }).toArray().filter(h => h)
  }

  dumpLru () {
    return this[LRU_LIST]
  }

  set (key, value, maxAge) {
    maxAge = maxAge || this[MAX_AGE];

    if (maxAge && typeof maxAge !== 'number')
      throw new TypeError('maxAge must be a number')

    const now = maxAge ? Date.now() : 0;
    const len = this[LENGTH_CALCULATOR](value, key);

    if (this[CACHE].has(key)) {
      if (len > this[MAX]) {
        del(this, this[CACHE].get(key));
        return false
      }

      const node = this[CACHE].get(key);
      const item = node.value;

      // dispose of the old one before overwriting
      // split out into 2 ifs for better coverage tracking
      if (this[DISPOSE]) {
        if (!this[NO_DISPOSE_ON_SET])
          this[DISPOSE](key, item.value);
      }

      item.now = now;
      item.maxAge = maxAge;
      item.value = value;
      this[LENGTH] += len - item.length;
      item.length = len;
      this.get(key);
      trim(this);
      return true
    }

    const hit = new Entry(key, value, len, now, maxAge);

    // oversized objects fall out of cache automatically.
    if (hit.length > this[MAX]) {
      if (this[DISPOSE])
        this[DISPOSE](key, value);

      return false
    }

    this[LENGTH] += hit.length;
    this[LRU_LIST].unshift(hit);
    this[CACHE].set(key, this[LRU_LIST].head);
    trim(this);
    return true
  }

  has (key) {
    if (!this[CACHE].has(key)) return false
    const hit = this[CACHE].get(key).value;
    return !isStale(this, hit)
  }

  get (key) {
    return get(this, key, true)
  }

  peek (key) {
    return get(this, key, false)
  }

  pop () {
    const node = this[LRU_LIST].tail;
    if (!node)
      return null

    del(this, node);
    return node.value
  }

  del (key) {
    del(this, this[CACHE].get(key));
  }

  load (arr) {
    // reset the cache
    this.reset();

    const now = Date.now();
    // A previous serialized cache has the most recent items first
    for (let l = arr.length - 1; l >= 0; l--) {
      const hit = arr[l];
      const expiresAt = hit.e || 0;
      if (expiresAt === 0)
        // the item was created without expiration in a non aged cache
        this.set(hit.k, hit.v);
      else {
        const maxAge = expiresAt - now;
        // dont add already expired items
        if (maxAge > 0) {
          this.set(hit.k, hit.v, maxAge);
        }
      }
    }
  }

  prune () {
    this[CACHE].forEach((value, key) => get(this, key, false));
  }
}

const get = (self, key, doUse) => {
  const node = self[CACHE].get(key);
  if (node) {
    const hit = node.value;
    if (isStale(self, hit)) {
      del(self, node);
      if (!self[ALLOW_STALE])
        return undefined
    } else {
      if (doUse) {
        if (self[UPDATE_AGE_ON_GET])
          node.value.now = Date.now();
        self[LRU_LIST].unshiftNode(node);
      }
    }
    return hit.value
  }
};

const isStale = (self, hit) => {
  if (!hit || (!hit.maxAge && !self[MAX_AGE]))
    return false

  const diff = Date.now() - hit.now;
  return hit.maxAge ? diff > hit.maxAge
    : self[MAX_AGE] && (diff > self[MAX_AGE])
};

const trim = self => {
  if (self[LENGTH] > self[MAX]) {
    for (let walker = self[LRU_LIST].tail;
      self[LENGTH] > self[MAX] && walker !== null;) {
      // We know that we're about to delete this one, and also
      // what the next least recently used key will be, so just
      // go ahead and set it now.
      const prev = walker.prev;
      del(self, walker);
      walker = prev;
    }
  }
};

const del = (self, node) => {
  if (node) {
    const hit = node.value;
    if (self[DISPOSE])
      self[DISPOSE](hit.key, hit.value);

    self[LENGTH] -= hit.length;
    self[CACHE].delete(hit.key);
    self[LRU_LIST].removeNode(node);
  }
};

class Entry {
  constructor (key, value, length, now, maxAge) {
    this.key = key;
    this.value = value;
    this.length = length;
    this.now = now;
    this.maxAge = maxAge || 0;
  }
}

const forEachStep = (self, fn, node, thisp) => {
  let hit = node.value;
  if (isStale(self, hit)) {
    del(self, node);
    if (!self[ALLOW_STALE])
      hit = undefined;
  }
  if (hit)
    fn.call(thisp, hit.value, hit.key, self);
};

var lruCache = LRUCache;

var cachedTownRegexes = new lruCache({
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
    var kanjiNumbers = dist.findKanjiNumbers(xCho[0]);
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

function unfetch_module(e,n){return n=n||{},new Promise(function(t,r){var s=new XMLHttpRequest,o=[],u=[],i={},a=function(){return {ok:2==(s.status/100|0),statusText:s.statusText,status:s.status,url:s.responseURL,text:function(){return Promise.resolve(s.responseText)},json:function(){return Promise.resolve(s.responseText).then(JSON.parse)},blob:function(){return Promise.resolve(new Blob([s.response]))},clone:a,headers:{keys:function(){return o},entries:function(){return u},get:function(e){return i[e.toLowerCase()]},has:function(e){return e.toLowerCase()in i}}}};for(var l in s.open(n.method||"get",e,!0),s.onload=function(){s.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm,function(e,n,t){o.push(n=n.toLowerCase()),u.push([n,t]),i[n]=i[n]?i[n]+","+t:t;}),t(a());},s.onerror=r,s.withCredentials="include"==n.credentials,n.headers)s.setRequestHeader(l,n.headers[l]);s.send(n.body||null);})}

var unfetch_module$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': unfetch_module
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(unfetch_module$1);

var browser = self.fetch || (self.fetch = require$$0.default || require$$0);

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
        return browser(url);
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
                                return dist.number2kanji(Number(num));
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

var config = config$1;
var normalize = normalize$1;

export { config, normalize };
