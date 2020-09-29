# @geolonia/normalize-japanese-addresses

オープンソースの住所正規化ライブラリです。

経産省の [IMI コンポーネントツール](https://info.gbiz.go.jp/tools/imi_tools/)のジオコーディングの仕組みからインスピレーションをうけて開発しました。

## 使い方

ライブラリは npm レジストリで `@geolonia/normalize-japanese-addresses` として配布されています。
npm コマンドなどを使って’インストールして下さい。

```shell
$ npm install @geolonia/normalize-japanese-addresses -S
```

### `normalize(address: string)`

```javascript
const { normalize } = require('@geolonia/normalize-japanese-addresses')
console.log(normalize('大阪府堺市北区新金岡町4丁1−8')) // 大阪府堺市北区新金岡町四丁1−8
```

## 開発者向け情報

まず、以下のコマンドで環境を用意してください。

```shell
$ git clone git@github.com:geolonia/normalize-japanese-addresses.git
$ cd normalize-japanese-addresses
$ npm install
```

### tree.json のビルド

`src/lib/tree.json` が住所の正規化に用いられるデータソースになります。
データを更新するためには以下のコマンドを実行してください。

```shell
$ npm run download
$ npm run tree
```

### 貢献方法

プルリクエストや Issue はいつでも歓迎します。

## ライセンス、利用規約

- ソースコードのライセンスは MIT ライセンスです。
- 取得した緯度経度の情報のご利用方法に制限はありません。他社の地図、アプリ、その他ご自由にご利用ください。
- ご利用に際しましては、できればソーシャルでのシェア、[Geolonia](https://geolonia.com/) へのリンクの設置などをしていただけると、開発者たちのモチベーションが上がると思います。

プルリクや Issue は大歓迎です。住所の正規化を工夫すれば精度があがりそうなので、そのあたりのアイディアを募集しています。
