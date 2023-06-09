# @geolonia/normalize-japanese-addresses

[![build](https://github.com/geolonia/normalize-japanese-addresses/actions/workflows/build.yml/badge.svg)](https://github.com/geolonia/normalize-japanese-addresses/actions/workflows/build.yml)

オープンソースの住所正規化ライブラリです。

経産省の [IMI コンポーネントツール](https://info.gbiz.go.jp/tools/imi_tools/)のジオコーディングの仕組みからインスピレーションをうけて開発しました。

## デモ

- https://codepen.io/geolonia/pen/oNBrqzL
- https://code4fukui.github.io/normalize-japanese-addresses/

##  インストール

ライブラリは npm レジストリで `@geolonia/normalize-japanese-addresses` として配布されています。
npm コマンドなどを使ってインストールして下さい。

```shell
$ npm install @geolonia/normalize-japanese-addresses -S
```

## 使い方

### `normalize(address: string, option: Option)`

住所を正規化します。

```javascript
const { normalize } = require('@geolonia/normalize-japanese-addresses')
normalize('北海道札幌市西区24-2-2-3-3').then(result => {
  console.log(result); // {"pref": "北海道", "city": "札幌市西区", "town": "二十四軒二条二丁目", "addr": "3-3", "lat": 43.074273, "lng": 141.315099, "level"; 3}
})
```

住所の正規化結果として戻されるオブジェクトには、`level` プロパティが含まれます。`level` には、住所文字列のどこまでを判別できたかを以下の数値で格納しています。

* `0` - 都道府県も判別できなかった。
* `1` - 都道府県まで判別できた。
* `2` - 市区町村まで判別できた。
* `3` - 町丁目まで判別できた。

例えば都道府県名のみを正規化したい場合、`level` オプションで指定することで処理を速くすることができます。

```javascript
const { normalize } = require('@geolonia/normalize-japanese-addresses')
normalize('北海道札幌市西区24-2-2-3-3', { level: 1 }).then(result => {
  console.log(result); // {"pref": "北海道", "city": "", "town": "", "addr": "札幌市西区二十四軒二条二丁目3-3", "lat": null, "lng": null, "level"; 1}
})
```

ESモジュールとして使う（ブラウザ or Deno）
```javascript
import { normalize } from "https://code4fukui.github.io/normalize-japanese-addresses/dist/main-es.js";

const result = await normalize('北海道札幌市西区24-2-2-3-3');
console.log(result);
```

### グローバルオプション

以下のパラメーターを変更することでライブラリの動作全体に関わる設定が変更できます。

#### `config.townCacheSize: number`

＠geolonia/normalize-japanese-addresses は市区町村毎の最新の町丁目のデータを web API から取得し住所の正規化を行います。`townCacheSize` オプションはキャッシュする市区町村の数を変更します。デフォルトは 1,000 件になっています。

#### `config.japaneseAddressesApi: string`

町丁目データを配信する web API のエンドポイントを指定します。デフォルトは `https://geolonia.github.io/japanese-addresses/api/ja` です。この API から配信されるデータのディレクトリ構成は [Geolonia 住所データ](https://github.com/geolonia/japanese-addresses/tree/develop/api)を参考にしてください。

このオプションに対して `file://` 形式の URL を指定することで、ローカルファイルとして保存したファイルを参照することができます。

##### 使用例

```shell
# Geolonia 住所データのダウンロード
$ curl -sL https://github.com/geolonia/japanese-addresses/archive/refs/heads/master.tar.gz | tar xvfz -
```

```javascript
const { config, normalize } = require('@geolonia/normalize-japanese-addresses')
config.japaneseAddressesApi = 'file:///path/to/japanese-addresses-master/api/ja'

(function(){
  for (address of addresses) {
    await normalize(address)
  }
})()
```

## 正規化の内容

* `XXX郡` などの郡の名前が省略されている住所に対しては、それを補完します。
* 住所に含まれるアルファベットと数字を半角に統一します。
* 京都の通り名を削除します。
* 新字体と旧字体のゆらぎを吸収して、国交省の位置参照情報に記載されている地名にあわせます。
* `ヶケが`、`ヵカか力`、`之ノの`、`ッツっつ` などのゆらぎを吸収して、国交省の位置参照情報に記載されている地名にあわせます。
* `釜`と`竈`、`埠頭`と`ふ頭`などの漢字のゆらぎを吸収します。
* 町丁目レベルに記載されている数字は、国交省の位置参照情報にあわせて、すべて漢数字に変換します。
* 番地や号レベルに記載されている数字はアラビア数字に変換し、`番地` などの文字列は `-` に変換します。
* 住所の末尾に建物名がある場合は、なるべくなにもしないでそのまま返す仕様になっていますが、できればあらかじめ分離していただいたほうがいいかもしれません。

参考:

* [ゆらぎを処理している文字列に関しては、ソースコードを御覧ください。](https://github.com/geolonia/normalize-japanese-addresses/blob/master/src/lib/dict.ts)
* [変換前、変換後の住所の例はテストコードを御覧ください。](https://github.com/geolonia/normalize-japanese-addresses/blob/master/test/main.test.ts)


## 開発者向け情報

まず、以下のコマンドで環境を用意してください。

```shell
$ git clone git@github.com:geolonia/normalize-japanese-addresses.git
$ cd normalize-japanese-addresses
$ npm install
```

次に、以下を実行してコンパイルをおこないます。

```shell
$ npm run build
```

dist フォルダ以下に main-node.js など必要なファイルが生成されるので、

```javascript
// sample.js
const { normalize } = require('./dist/main-node.js');
normalize('北海道札幌市西区24-2-2-3-3', { level: 3 }).then(result => {
  console.log(result); // { "pref": "北海道", "city": "", "town": "", "addr": "札幌市西区二十四軒二条二丁目3-3", "level": 1 }
})
```

という内容で sample.js を用意したら、

```shell
$ node sample.js
```

でサンプルファイルを実行することができます。

## 注意

* この正規化エンジンは、住所の「名寄せ」を目的としており、たとえば京都の「通り名」は削除します。
  * 郵便や宅急便などに使用される住所としては、問題ないと考えています。
* この正規化エンジンは、町丁目及び小字レベルまでは対応していますが、それ以降については対応しておりません。
* 住居表示が未整備の地域については全体的に苦手です。

### 貢献方法

[プルリクエスト](https://github.com/geolonia/normalize-japanese-addresses/pulls) や [Issue](https://github.com/geolonia/normalize-japanese-addresses/issues) はいつでも歓迎します。

## ライセンス、利用規約

- ソースコードのライセンスは MIT ライセンスです。
- ご利用に際しましては、できればソーシャルでのシェア、[Geolonia](https://geolonia.com/) へのリンクの設置などをしていただけると、開発者たちのモチベーションが上がると思います。

住所の正規化を工夫すれば精度があがりそうなので、そのあたりのアイディアを募集しています。
