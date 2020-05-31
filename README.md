# Community Geocoder

オープンソースのジオコーディング API です。

経産省の [IMI コンポーネントツール](https://info.gbiz.go.jp/tools/imi_tools/)のジオコーディングの仕組みからインスピレーションをうけて開発しました。

デモ: https://community-geocoder.geolonia.com/

[無料で利用できてオープンソースの、住所から緯度経度を検索するためのジオコーディング API を公開しました。](https://blog.geolonia.com/2020/06/01/community-geocoder.html)

## 特徴

* 国土交通省の位置参照情報の「大字・町丁目レベル位置参照情報」を利用したジオコーディングサービスです。
  * JavaScript API と緯度経度の API を提供しています。
* API は GitHub ページで静的ファイルとしてホストしています。
* オープンソースなので誰でもフォークすることができ、利用規約の変更などを気にすることなく、安心して利用することができます。
* ソースコードのライセンスは MIT ライセンスです。取得した位置情報のご利用はご自由にどうぞ。

経産省の [IMI コンポーネントツール](https://info.gbiz.go.jp/tools/imi_tools/) でも同じレベルの精度のジオコーディングが可能ですが、IMI コンポーネントツールは、自力で Node.js サーバーをホストする必要があります。

本プロジェクトは、GitHub ページ上に静的ファイルとしてジオコーディング用の API をホストしているため、独自のサーバーを用意しなくても利用することができます。

## 仕組み

経産省の [IMI コンポーネントツール](https://info.gbiz.go.jp/tools/imi_tools/) では、住所をコードに変換し、levelDB というキーバリューストア内でそのコードを検索することにより緯度経度を取得しています。

このプロジェクトではその仕組を応用して、キーバリューストアではなくスタティックなファイルとすることで API を実装して、クライアントから使いやすくしました。

* 「東京都千代田区霞が関1-3-1」のような住所を受け取ると、この住所を分解し、IMI コンポーネントツールからフォークしたライブラリで「大字町丁目コード」を取得します。
* このコードは、「131010002001」のような12桁の数字になっており、API 上にある同名の JSON ファイルにアクセスすることで、その中に記述されている緯度経度を取得しています。
* API 内には、膨大な量のファイルが存在するため、`都道府県コード/市町村コード/大字町丁目コード.json` のようなディレクトリ構造とすることで、ファイルシステムの制限を回避しています。

## 使い方

以下の JavaScript API をウェブページから読み込んでください。

```html
<script src="https://cdn.geolonia.com/community-geocoder.js"></script>
```

API 関数 `getLatLng()` を任意のクリックイベント等でコールしてください。

```javascript
document.getElementById('exec').addEventListener('click', () => {
  if (document.getElementById('address').value) {
    getLatLng(document.getElementById('address').value, (latlng) => {
      map.setCenter(latlng)
    })
  }
})
```

### `getLatLng(address, callback, errorCallback)`

* `address` - 緯度経度を取得したい住所の文字列
* `callback` - 緯度経度を取得したあとで実行したいコールバック関数。コールバック関数の第一引き数には緯度経度のオブジェクトが渡されます。
* `errorCallback` - エラー時のコールバック関数。エラーオブジェクトが引き数として渡されます。

コールバック関数に引き数として渡される緯度経度のオブジェクトは以下のようになっています。

```javascript
{
  addr: "大阪市中央区xxx",
  lat: 35.1234,
  lng: 135.1234,
}
```

## 開発者向け情報

まず、以下のコマンドで環境を用意してください。

```
$ git clone git@github.com:geolonia/community-geocoder.git
$ cd community-geocoder
$ npm install
```

### JavaScript API の開発方法

`src/api.js` がこのサービスで提供される JavaScript API のソースです。 以下のコマンドでブラウザで確認しながら作業できます。

```
$ npm start
```

### タイルのメンテナンス方法

```
npm run build:api
```

プルリクエストはいつでも歓迎します。

## ライセンス、利用規約

* ソースコードのライセンスは MIT ライセンスです。
* 取得した緯度経度の情報のご利用方法に制限はありません。他社の地図、アプリ、その他ご自由にご利用ください。
* ご利用に際しましては、できればソーシャルでのシェア、[Geolonia](https://geolonia.com/) へのリンクの設置などをしていただけると、開発者たちのモチベーションが上がると思います。
