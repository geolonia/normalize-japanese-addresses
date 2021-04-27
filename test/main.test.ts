import { normalize } from '../src/main'

test('大阪府堺市北区新金岡町4丁1−8', async () => {
  const res = await normalize('大阪府堺市北区新金岡町4丁1−8')
  expect(res).toStrictEqual({"pref": "大阪府", "city": "堺市北区", "town": "新金岡町四丁", "addr": "1-8", "level": 3})
})

test('大阪府堺市北区新金岡町４丁１ー８', async () => {
  const res = await normalize('大阪府堺市北区新金岡町４丁１ー８')
  expect(res).toStrictEqual({"pref": "大阪府", "city": "堺市北区", "town": "新金岡町四丁", "addr": "1-8", "level": 3})
})

test('和歌山県串本町串本1234', async () => {
  const res = await normalize('和歌山県串本町串本1234')
  expect(res).toStrictEqual({"pref": "和歌山県", "city": "東牟婁郡串本町", "town": "串本", "addr": "1234", "level": 3})
})

test('和歌山県東牟婁郡串本町串本1234', async () => {
  const res = await normalize('和歌山県東牟婁郡串本町串本1234')
  expect(res).toStrictEqual({"pref": "和歌山県", "city": "東牟婁郡串本町", "town": "串本", "addr": "1234", "level": 3})
})

test('和歌山県東牟婁郡串本町串本千二百三十四', async () => {
  const res = await normalize('和歌山県東牟婁郡串本町串本千二百三十四')
  expect(res).toStrictEqual({"pref": "和歌山県", "city": "東牟婁郡串本町", "town": "串本", "addr": "1234", "level": 3})
})

test('和歌山県東牟婁郡串本町串本一千二百三十四', async () => {
  const res = await normalize('和歌山県東牟婁郡串本町串本一千二百三十四')
  expect(res).toStrictEqual({"pref": "和歌山県", "city": "東牟婁郡串本町", "town": "串本", "addr": "1234", "level": 3})
})

test('和歌山県東牟婁郡串本町串本一二三四', async () => {
  const res = await normalize('和歌山県東牟婁郡串本町串本一二三四')
  expect(res).toStrictEqual({"pref": "和歌山県", "city": "東牟婁郡串本町", "town": "串本", "addr": "1234", "level": 3})
})

test('和歌山県東牟婁郡串本町くじ野川一二三四', async () => {
  const res = await normalize('和歌山県東牟婁郡串本町くじ野川一二三四')
  expect(res).toStrictEqual({"pref": "和歌山県", "city": "東牟婁郡串本町", "town": "鬮野川", "addr": "1234", "level": 3})
})

test('京都府京都市中京区寺町通御池上る上本能寺前町488番地', async () => {
  const res = await normalize(
    '京都府京都市中京区寺町通御池上る上本能寺前町488番地',
  )
  expect(res).toStrictEqual({"pref": "京都府", "city": "京都市中京区", "town": "上本能寺前町", "addr": "488", "level": 3})
})

test('京都府京都市中京区上本能寺前町488', async () => {
  const res = await normalize('京都府京都市中京区上本能寺前町488')
  expect(res).toStrictEqual({"pref": "京都府", "city": "京都市中京区", "town": "上本能寺前町", "addr": "488", "level": 3})
})

test('大阪府大阪市中央区大手前２-１', async () => {
  const res = await normalize('大阪府大阪市中央区大手前２-１')
  expect(res).toStrictEqual({"pref": "大阪府", "city": "大阪市中央区", "town": "大手前二丁目", "addr": "1", "level": 3})
})

test('北海道札幌市西区二十四軒二条2丁目3番3号', async () => {
  const res = await normalize('北海道札幌市西区24-2-2-3-3')
  expect(res).toStrictEqual({"pref": "北海道", "city": "札幌市西区", "town": "二十四軒二条二丁目", "addr": "3-3", "level": 3})
})

test('京都府京都市東山区大和大路2-537-1', async () => {
  const res = await normalize('京都府京都市東山区大和大路2-537-1')
  expect(res).toStrictEqual({"pref": "京都府", "city": "京都市東山区", "town": "大和大路二丁目", "addr": "537-1", "level": 3})
})

test('京都府京都市東山区大和大路2丁目五百三十七-1', async () => {
  const res = await normalize('京都府京都市東山区大和大路2丁目五百三十七の1')
  expect(res).toStrictEqual({"pref": "京都府", "city": "京都市東山区", "town": "大和大路二丁目", "addr": "537-1", "level": 3})
})

test('愛知県蒲郡市旭町17番1号', async () => {
  const res = await normalize('愛知県蒲郡市旭町17番1号')
  expect(res).toStrictEqual({"pref": "愛知県", "city": "蒲郡市", "town": "旭町", "addr": "17-1", "level": 3})
})

test('北海道岩見沢市栗沢町万字寿町１−２', async () => {
  const res = await normalize('北海道岩見沢市栗沢町万字寿町１−２')
  expect(res).toStrictEqual({"pref": "北海道", "city": "岩見沢市", "town": "栗沢町万字寿町", "addr": "1-2", "level": 3})
})

test('北海道久遠郡せたな町北檜山区北檜山１９３', async () => {
  const res = await normalize('北海道久遠郡せたな町北檜山区北檜山１９３')
  expect(res).toStrictEqual({"pref": "北海道", "city": "久遠郡せたな町", "town": "北檜山区北檜山", "addr": "193", "level": 3})
})

test('北海道久遠郡せたな町北桧山区北桧山１９３', async () => {
  const res = await normalize('北海道久遠郡せたな町北桧山区北桧山１９３')
  expect(res).toStrictEqual({"pref": "北海道", "city": "久遠郡せたな町", "town": "北檜山区北檜山", "addr": "193", "level": 3})
})

test('京都府京都市中京区錦小路通大宮東入七軒町466', async () => {
  const res = await normalize('京都府京都市中京区錦小路通大宮東入七軒町466')
  expect(res).toStrictEqual({"pref": "京都府", "city": "京都市中京区", "town": "七軒町", "addr": "466", "level": 3})
})

test('栃木県佐野市七軒町2201', async () => {
  const res = await normalize('栃木県佐野市七軒町2201')
  expect(res).toStrictEqual({"pref": "栃木県", "city": "佐野市", "town": "七軒町", "addr": "2201", "level": 3})
})

test('京都府京都市東山区大和大路通三条下る東入若松町393', async () => {
  const res = await normalize(
    '京都府京都市東山区大和大路通三条下る東入若松町393',
  )
  expect(res).toStrictEqual({"pref": "京都府", "city": "京都市東山区", "town": "若松町", "addr": "393", "level": 3})
})

test('長野県長野市長野東之門町2462', async () => {
  const res = await normalize('長野県長野市長野東之門町2462')
  expect(res).toStrictEqual({"pref": "長野県", "city": "長野市", "town": "長野", "addr": "東之門町2462", "level": 3})
})

test('岩手県下閉伊郡普代村第１地割上村４３−２５', async () => {
  const res = await normalize('岩手県下閉伊郡普代村第１地割上村４３−２５')
  expect(res).toStrictEqual({"pref": "岩手県", "city": "下閉伊郡普代村", "town": "第一地割字上村", "addr": "43-25", "level": 3})
})

test('岩手県花巻市下北万丁目１７４−１', async () => {
  const res = await normalize('岩手県花巻市下北万丁目１７４−１')
  expect(res).toStrictEqual({"pref": "岩手県", "city": "花巻市", "town": "下北万丁目", "addr": "174-1", "level": 3})
})

test('岩手県花巻市十二丁目１１９２', async () => {
  const res = await normalize('岩手県花巻市十二丁目１１９２')
  expect(res).toStrictEqual({"pref": "岩手県", "city": "花巻市", "town": "十二丁目", "addr": "1192", "level": 3})
})

test('岩手県滝沢市後２６８−５６６', async () => {
  const res = await normalize('岩手県滝沢市後２６８−５６６')
  expect(res).toStrictEqual({"pref": "岩手県", "city": "滝沢市", "town": "後", "addr": "268-566", "level": 3})
})

test('青森県五所川原市金木町喜良市千苅６２−８', async () => {
  const res = await normalize('青森県五所川原市金木町喜良市千苅６２−８')
  expect(res).toStrictEqual({"pref": "青森県", "city": "五所川原市", "town": "金木町喜良市", "addr": "千苅62-8", "level": 3})
})

test('岩手県盛岡市盛岡駅西通２丁目９番地１号', async () => {
  const res = await normalize('岩手県盛岡市盛岡駅西通２丁目９番地１号')
  expect(res).toStrictEqual({"pref": "岩手県", "city": "盛岡市", "town": "盛岡駅西通二丁目", "addr": "9-1", "level": 3})
})

test('岩手県盛岡市盛岡駅西通２丁目９の１', async () => {
  const res = await normalize('岩手県盛岡市盛岡駅西通２丁目９の１')
  expect(res).toStrictEqual({"pref": "岩手県", "city": "盛岡市", "town": "盛岡駅西通二丁目", "addr": "9-1", "level": 3})
})

test('岩手県盛岡市盛岡駅西通２の９の１', async () => {
  const res = await normalize('岩手県盛岡市盛岡駅西通２の９の１')
  expect(res).toStrictEqual({"pref": "岩手県", "city": "盛岡市", "town": "盛岡駅西通二丁目", "addr": "9-1", "level": 3})
})

test('東京都文京区千石4丁目15－7', async () => {
  const res = await normalize('東京都文京区千石4丁目15-7')
  expect(res).toStrictEqual({"pref": "東京都", "city": "文京区", "town": "千石四丁目", "addr": "15-7", "level": 3})
})

test('東京都文京区千石四丁目15－7', async () => {
  const res = await normalize('東京都文京区千石四丁目15-7')
  expect(res).toStrictEqual({"pref": "東京都", "city": "文京区", "town": "千石四丁目", "addr": "15-7", "level": 3})
})

test('東京都文京区千石4丁目15－7', async () => {
  const res = await normalize('東京都文京区千石4丁目15－7')
  expect(res).toStrictEqual({"pref": "東京都", "city": "文京区", "town": "千石四丁目", "addr": "15-7", "level": 3})
})

test('東京都 文京区千石4丁目15－7', async () => {
  const res = await normalize('東京都 文京区千石4丁目15－7')
  expect(res).toStrictEqual({"pref": "東京都", "city": "文京区", "town": "千石四丁目", "addr": "15-7", "level": 3})
})

test('東京都文京区 千石4丁目15－7', async () => {
  const res = await normalize('東京都文京区 千石4丁目15－7')
  expect(res).toStrictEqual({"pref": "東京都", "city": "文京区", "town": "千石四丁目", "addr": "15-7", "level": 3})
})

test('東京都文京区千石4-15-7 ', async () => {
  const res = await normalize('東京都文京区千石4-15-7 ')
  expect(res).toStrictEqual({"pref": "東京都", "city": "文京区", "town": "千石四丁目", "addr": "15-7", "level": 3})
})

test('和歌山県東牟婁郡串本町串本 833', async () => {
  const res = await normalize('和歌山県東牟婁郡串本町串本 833')
  expect(res).toStrictEqual({"pref": "和歌山県", "city": "東牟婁郡串本町", "town": "串本", "addr": "833", "level": 3})
})

test('和歌山県東牟婁郡串本町串本　833', async () => {
  const res = await normalize('和歌山県東牟婁郡串本町串本　833')
  expect(res).toStrictEqual({"pref": "和歌山県", "city": "東牟婁郡串本町", "town": "串本", "addr": "833", "level": 3})
})

test('東京都世田谷区上北沢４の９の２', async () => {
  const res = await normalize('東京都世田谷区上北沢４の９の２')
  expect(res).toStrictEqual({"pref": "東京都", "city": "世田谷区", "town": "上北沢四丁目", "addr": "9-2", "level": 3})
})

test('東京都品川区東五反田２丁目５－１１', async () => {
  const res = await normalize('東京都品川区東五反田２丁目５－１１')
  expect(res).toStrictEqual({"pref": "東京都", "city": "品川区", "town": "東五反田二丁目", "addr": "5-11", "level": 3})
})

test('東京都世田谷区上北沢四丁目2-1', async () => {
  const res = await normalize('東京都世田谷区上北沢四丁目2-1')
  expect(res).toStrictEqual({"pref": "東京都", "city": "世田谷区", "town": "上北沢四丁目", "addr": "2-1", "level": 3})
})

test('東京都世田谷区上北沢4-2-1', async () => {
  const res = await normalize('東京都世田谷区上北沢4-2-1')
  expect(res).toStrictEqual({"pref": "東京都", "city": "世田谷区", "town": "上北沢四丁目", "addr": "2-1", "level": 3})
})

test('東京都世田谷区上北沢４ー２ー１', async () => {
  const res = await normalize('東京都世田谷区上北沢４ー２ー１')
  expect(res).toStrictEqual({"pref": "東京都", "city": "世田谷区", "town": "上北沢四丁目", "addr": "2-1", "level": 3})
})

test('東京都世田谷区上北沢４－２－１', async () => {
  const res = await normalize('東京都世田谷区上北沢４－２－１')
  expect(res).toStrictEqual({"pref": "東京都", "city": "世田谷区", "town": "上北沢四丁目", "addr": "2-1", "level": 3})
})

test('東京都品川区西五反田2丁目31-6', async () => {
  const res = await normalize('東京都品川区西五反田2丁目31-6')
  expect(res).toStrictEqual({"pref": "東京都", "city": "品川区", "town": "西五反田二丁目", "addr": "31-6", "level": 3})
})

test('東京都品川区西五反田2-31-6', async () => {
  const res = await normalize('東京都品川区西五反田2-31-6')
  expect(res).toStrictEqual({"pref": "東京都", "city": "品川区", "town": "西五反田二丁目", "addr": "31-6", "level": 3})
})

test('大阪府大阪市此花区西九条三丁目２－１６', async () => {
  const res = await normalize('大阪府大阪市此花区西九条三丁目２－１６')
  expect(res).toStrictEqual({"pref": "大阪府", "city": "大阪市此花区", "town": "西九条三丁目", "addr": "2-16", "level": 3})
})

test('大阪府大阪市此花区西九条三丁目2番16号', async () => {
  const res = await normalize('大阪府大阪市此花区西九条三丁目2番16号')
  expect(res).toStrictEqual({"pref": "大阪府", "city": "大阪市此花区", "town": "西九条三丁目", "addr": "2-16", "level": 3})
})

test('大阪府大阪市此花区西九条3-2-16', async () => {
  const res = await normalize('大阪府大阪市此花区西九条3-2-16')
  expect(res).toStrictEqual({"pref": "大阪府", "city": "大阪市此花区", "town": "西九条三丁目", "addr": "2-16", "level": 3})
})

test('大阪府大阪市此花区西九条３丁目２－１６', async () => {
  const res = await normalize('大阪府大阪市此花区西九条３丁目２－１６')
  expect(res).toStrictEqual({"pref": "大阪府", "city": "大阪市此花区", "town": "西九条三丁目", "addr": "2-16", "level": 3})
})

test('大阪府大阪市此花区西九条3-2-16', async () => {
  const res = await normalize('大阪府大阪市此花区西九条3-2-16')
  expect(res).toStrictEqual({"pref": "大阪府", "city": "大阪市此花区", "town": "西九条三丁目", "addr": "2-16", "level": 3})
})

test('千葉県鎌ケ谷市中佐津間２丁目１５－１４－９', async () => {
  const res = await normalize('千葉県鎌ケ谷市中佐津間２丁目１５－１４－９')
  expect(res).toStrictEqual({"pref": "千葉県", "city": "鎌ヶ谷市", "town": "中佐津間二丁目", "addr": "15-14-9", "level": 3})
})

test('岐阜県不破郡関ケ原町関ヶ原１７０１−６', async () => {
  const res = await normalize('岐阜県不破郡関ケ原町関ヶ原１７０１−６')
  expect(res).toStrictEqual({"pref": "岐阜県", "city": "不破郡関ケ原町", "town": "関ケ原", "addr": "1701-6", "level": 3})
})

test('岐阜県関ケ原町関ヶ原１７０１−６', async () => {
  const res = await normalize('岐阜県関ケ原町関ヶ原１７０１−６')
  expect(res).toStrictEqual({"pref": "岐阜県", "city": "不破郡関ケ原町", "town": "関ケ原", "addr": "1701-6", "level": 3})
})

test('東京都町田市木曽東4丁目14-イ22', async () => {
  const res = await normalize('東京都町田市木曽東4丁目14-イ22')
  expect(res).toStrictEqual({"pref": "東京都", "city": "町田市", "town": "木曽東四丁目", "addr": "14-イ22", "level": 3})
})

test('東京都町田市木曽東4丁目14-イ22', async () => {
  const res = await normalize('東京都町田市木曽東4丁目14ーイ22')
  expect(res).toStrictEqual({"pref": "東京都", "city": "町田市", "town": "木曽東四丁目", "addr": "14-イ22", "level": 3})
})

test('東京都町田市木曽東4丁目14-イ22', async () => {
  const res = await normalize('東京都町田市木曽東四丁目十四ーイ二十二')
  expect(res).toStrictEqual({"pref": "東京都", "city": "町田市", "town": "木曽東四丁目", "addr": "14-イ22", "level": 3})
})

test('東京都町田市木曽東4丁目14-イ22', async () => {
  const res = await normalize('東京都町田市木曽東四丁目１４ーイ２２')
  expect(res).toStrictEqual({"pref": "東京都", "city": "町田市", "town": "木曽東四丁目", "addr": "14-イ22", "level": 3})
})

test('東京都町田市木曽東4丁目14のイ22', async () => {
  const res = await normalize('東京都町田市木曽東四丁目１４のイ２２')
  expect(res).toStrictEqual({"pref": "東京都", "city": "町田市", "town": "木曽東四丁目", "addr": "14-イ22", "level": 3})
})

test('岩手県花巻市南万丁目127', async () => {
  const res = await normalize('岩手県花巻市南万丁目127')
  expect(res).toStrictEqual({"pref": "岩手県", "city": "花巻市", "town": "南万丁目", "addr": "127", "level": 3})
})

test('和歌山県東牟婁郡串本町田並1512', async () => {
  const res = await normalize('和歌山県東牟婁郡串本町田並1512')
  expect(res).toStrictEqual({"pref": "和歌山県", "city": "東牟婁郡串本町", "town": "田並", "addr": "1512", "level": 3})
})

test('神奈川県川崎市多摩区東三田1-2-2', async () => {
  const res = await normalize('神奈川県川崎市多摩区東三田1-2-2')
  expect(res).toStrictEqual({"pref": "神奈川県", "city": "川崎市多摩区", "town": "東三田一丁目", "addr": "2-2", "level": 3})
})

test('東京都町田市木曽東４の１４のイ２２', async () => {
  const res = await normalize('東京都町田市木曽東４の１４のイ２２')
  expect(res).toStrictEqual({"pref": "東京都", "city": "町田市", "town": "木曽東四丁目", "addr": "14-イ22", "level": 3})
})

test('東京都町田市木曽東４ー１４ーイ２２', async () => {
  const res = await normalize('東京都町田市木曽東４ー１４ーイ２２')
  expect(res).toStrictEqual({"pref": "東京都", "city": "町田市", "town": "木曽東四丁目", "addr": "14-イ22", "level": 3})
})

test('富山県富山市三番町1番23号', async () => {
  const res = await normalize('富山県富山市三番町1番23号')
  expect(res).toStrictEqual({"pref": "富山県", "city": "富山市", "town": "三番町", "addr": "1-23", "level": 3})
})

test('富山県富山市3-1-23', async () => {
  const res = await normalize('富山県富山市3-1-23')
  expect(res).toStrictEqual({"pref": "富山県", "city": "富山市", "town": "三番町", "addr": "1-23", "level": 3})
})

test('富山県富山市中央通り3-1-23', async () => {
  const res = await normalize('富山県富山市中央通り3-1-23')
  expect(res).toStrictEqual({"pref": "富山県", "city": "富山市", "town": "中央通り三丁目", "addr": "1-23", "level": 3})
})

test('埼玉県南埼玉郡宮代町大字国納３０9－１', async () => {
  const res = await normalize('埼玉県南埼玉郡宮代町大字国納３０9－１')
  expect(res).toStrictEqual({"pref": "埼玉県", "city": "南埼玉郡宮代町", "town": "国納", "addr": "309-1", "level": 3})
})

test('埼玉県南埼玉郡宮代町国納３０9－１', async () => {
  const res = await normalize('埼玉県南埼玉郡宮代町国納３０9－１')
  expect(res).toStrictEqual({"pref": "埼玉県", "city": "南埼玉郡宮代町", "town": "国納", "addr": "309-1", "level": 3})
})

test('大阪府高槻市奈佐原２丁目１－２ メゾンエトワール', async () => {
  const res = await normalize('大阪府高槻市奈佐原２丁目１－２ メゾンエトワール')
  expect(res).toStrictEqual({"pref": "大阪府", "city": "高槻市", "town": "奈佐原二丁目", "addr": "1-2 メゾンエトワール", "level": 3})
})

test('埼玉県八潮市大字大瀬１丁目１－１', async () => {
  const res = await normalize('埼玉県八潮市大字大瀬１丁目１－１')
  expect(res).toStrictEqual({"pref": "埼玉県", "city": "八潮市", "town": "大瀬一丁目", "addr": "1-1", "level": 3})
})

test('岡山県笠岡市大宜1249－1', async () => {
  const res = await normalize('岡山県笠岡市大宜1249－1')
  expect(res).toStrictEqual({"pref": "岡山県", "city": "笠岡市", "town": "大宜", "addr": "1249-1", "level": 3})
})

test('岡山県笠岡市大宜1249－1', async () => {
  const res = await normalize('岡山県笠岡市大宜1249－1')
  expect(res).toStrictEqual({"pref": "岡山県", "city": "笠岡市", "town": "大宜", "addr": "1249-1", "level": 3})
})

test('岡山県笠岡市大冝1249－1', async () => {
  const res = await normalize('岡山県笠岡市大冝1249－1')
  expect(res).toStrictEqual({"pref": "岡山県", "city": "笠岡市", "town": "大宜", "addr": "1249-1", "level": 3})
})

test('岡山県岡山市中区さい33-2', async () => {
  const res = await normalize('岡山県岡山市中区さい33-2')
  expect(res).toStrictEqual({"pref": "岡山県", "city": "岡山市中区", "town": "さい", "addr": "33-2", "level": 3})
})

test('岡山県岡山市中区穝33-2', async () => {
  const res = await normalize('岡山県岡山市中区穝33-2')
  expect(res).toStrictEqual({"pref": "岡山県", "city": "岡山市中区", "town": "さい", "addr": "33-2", "level": 3})
})

test('千葉県松戸市栄町３丁目１６６－５', async () => {
  const res = await normalize('千葉県松戸市栄町３丁目１６６－５')
  expect(res).toStrictEqual({"pref": "千葉県", "city": "松戸市", "town": "栄町三丁目", "addr": "166-5", "level": 3})
})

test('東京都新宿区三栄町１７－１６', async () => {
  const res = await normalize('東京都新宿区三栄町１７－１６')
  expect(res).toStrictEqual({"pref": "東京都", "city": "新宿区", "town": "四谷三栄町", "addr": "17-16", "level": 3})
})

test('東京都新宿区三榮町１７－１６', async () => {
  const res = await normalize('東京都新宿区三榮町１７－１６')
  expect(res).toStrictEqual({"pref": "東京都", "city": "新宿区", "town": "四谷三栄町", "addr": "17-16", "level": 3})
})

test('新潟県新潟市中央区礎町通１ノ町１９６８−１', async () => {
  const res = await normalize('新潟県新潟市中央区礎町通１ノ町１９６８−１')
  expect(res).toStrictEqual({"pref": "新潟県", "city": "新潟市中央区", "town": "礎町通一ノ町", "addr": "1968-1", "level": 3})
})

test('新潟県新潟市中央区礎町通１の町１９６８−１', async () => {
  const res = await normalize('新潟県新潟市中央区礎町通１の町１９６８−１')
  expect(res).toStrictEqual({"pref": "新潟県", "city": "新潟市中央区", "town": "礎町通一ノ町", "addr": "1968-1", "level": 3})
})

test('新潟県新潟市中央区礎町通１の町１９６８の１', async () => {
  const res = await normalize('新潟県新潟市中央区礎町通１の町１９６８の１')
  expect(res).toStrictEqual({"pref": "新潟県", "city": "新潟市中央区", "town": "礎町通一ノ町", "addr": "1968-1", "level": 3})
})

test('新潟県新潟市中央区礎町通1-1968-1', async () => {
  const res = await normalize('新潟県新潟市中央区礎町通1-1968-1')
  expect(res).toStrictEqual({"pref": "新潟県", "city": "新潟市中央区", "town": "礎町通一ノ町", "addr": "1968-1", "level": 3})
})

test('新潟県新潟市中央区上大川前通11番町1881-2', async () => {
  const res = await normalize('新潟県新潟市中央区上大川前通11番町1881-2')
  expect(res).toStrictEqual({"pref": "新潟県", "city": "新潟市中央区", "town": "上大川前通十一番町", "addr": "1881-2", "level": 3})
})

test('新潟県新潟市中央区上大川前通11-1881-2', async () => {
  const res = await normalize('新潟県新潟市中央区上大川前通11-1881-2')
  expect(res).toStrictEqual({"pref": "新潟県", "city": "新潟市中央区", "town": "上大川前通十一番町", "addr": "1881-2", "level": 3})
})

test('新潟県新潟市中央区上大川前通十一番町1881-2', async () => {
  const res = await normalize('新潟県新潟市中央区上大川前通十一番町1881-2')
  expect(res).toStrictEqual({"pref": "新潟県", "city": "新潟市中央区", "town": "上大川前通十一番町", "addr": "1881-2", "level": 3})
})

test('埼玉県上尾市壱丁目１１１', async () => {
  const res = await normalize('埼玉県上尾市壱丁目１１１')
  expect(res).toStrictEqual({"pref": "埼玉県", "city": "上尾市", "town": "壱丁目", "addr": "111", "level": 3})
})

test('埼玉県上尾市一丁目１１１', async () => {
  const res = await normalize('埼玉県上尾市一丁目１１１')
  expect(res).toStrictEqual({"pref": "埼玉県", "city": "上尾市", "town": "壱丁目", "addr": "111", "level": 3})
})

test('埼玉県上尾市一町目１１１', async () => {
  const res = await normalize('埼玉県上尾市一町目１１１')
  expect(res).toStrictEqual({"pref": "埼玉県", "city": "上尾市", "town": "壱丁目", "addr": "111", "level": 3})
})

test('埼玉県上尾市壱町目１１１', async () => {
  const res = await normalize('埼玉県上尾市壱町目１１１')
  expect(res).toStrictEqual({"pref": "埼玉県", "city": "上尾市", "town": "壱丁目", "addr": "111", "level": 3})
})

test('埼玉県上尾市1-111', async () => {
  const res = await normalize('埼玉県上尾市1-111')
  expect(res).toStrictEqual({"pref": "埼玉県", "city": "上尾市", "town": "壱丁目", "addr": "111", "level": 3})
})

test('神奈川県横浜市港北区大豆戸町１７番地１１', async () => {
  const res = await normalize('神奈川県横浜市港北区大豆戸町１７番地１１')
  expect(res).toStrictEqual({"pref": "神奈川県", "city": "横浜市港北区", "town": "大豆戸町", "addr": "17-11", "level": 3})
})

test('It should get the level `1` with `神奈川県横浜市港北区大豆戸町１７番地１１`', async () => {
  const res = await normalize('神奈川県横浜市港北区大豆戸町１７番地１１', {
    level: 1
  })
  expect(res).toStrictEqual({ "pref": "神奈川県", "city": "", "town": "", "addr": "横浜市港北区大豆戸町17番地11", "level": 1})
})

test('It should get the level `2` with `神奈川県横浜市港北区大豆戸町１７番地１１`', async () => {
  const res = await normalize('神奈川県横浜市港北区大豆戸町１７番地１１', {
    level: 2
  })
  expect(res).toStrictEqual({ "pref": "神奈川県", "city": "横浜市港北区", "town": "", "addr": "大豆戸町17番地11", "level": 2})
})

test('It should get the level `3` with `神奈川県横浜市港北区大豆戸町１７番地１１`', async () => {
  const res = await normalize('神奈川県横浜市港北区大豆戸町１７番地１１', {
    level: 3
  })
  expect(res).toStrictEqual({ "pref": "神奈川県", "city": "横浜市港北区", "town": "大豆戸町", "addr": "17-11", "level": 3})
})

test('It should get the level `2` with `神奈川県横浜市港北区`', async () => {
  const res = await normalize('神奈川県横浜市港北区', {
    level: 3
  })
  expect(res).toStrictEqual({ "pref": "神奈川県", "city": "横浜市港北区", "town": "", "addr": "", "level": 2})
})

test('It should get the level `1` with `神奈川県`', async () => {
  const res = await normalize('神奈川県', {
    level: 3
  })
  expect(res).toStrictEqual({ "pref": "神奈川県", "city": "", "town": "", "addr": "", "level": 1})
})

test('It should get the level `1` with `神奈川県あいうえお市`', async () => {
  const res = await normalize('神奈川県あいうえお市')
  expect(res).toStrictEqual({ "pref": "神奈川県", "city": "", "town": "", "addr": "あいうえお市", "level": 1})
})

test('It should get the level `2` with `東京都港区あいうえお`', async () => {
  const res = await normalize('東京都港区あいうえお')
  expect(res).toStrictEqual({ "pref": "東京都", "city": "港区", "town": "", "addr": "あいうえお", "level": 2})
})

test('It should get the level `0` with `あいうえお`', async () => {
  const res = await normalize('あいうえお')
  expect(res).toStrictEqual({ "pref": "", "city": "", "town": "", "addr": "あいうえお", "level": 0})
})

test('東京都江東区豊洲1丁目2-27', async () => {
  const res = await normalize('東京都江東区豊洲1丁目2-27')
  expect(res).toStrictEqual({ "pref": "東京都", "city": "江東区", "town": "豊洲一丁目", "addr": "2-27", "level": 3})
})

test('東京都江東区豊洲 1丁目2-27', async () => {
  const res = await normalize('東京都江東区豊洲 1丁目2-27')
  expect(res).toStrictEqual({ "pref": "東京都", "city": "江東区", "town": "豊洲一丁目", "addr": "2-27", "level": 3})
})

test('東京都江東区豊洲 1-2-27', async () => {
  const res = await normalize('東京都江東区豊洲 1-2-27')
  expect(res).toStrictEqual({ "pref": "東京都", "city": "江東区", "town": "豊洲一丁目", "addr": "2-27", "level": 3})
})

test('東京都 江東区 豊洲 1-2-27', async () => {
  const res = await normalize('東京都 江東区 豊洲 1-2-27')
  expect(res).toStrictEqual({ "pref": "東京都", "city": "江東区", "town": "豊洲一丁目", "addr": "2-27", "level": 3})
})

test('東京都江東区豊洲 １ー２ー２７', async () => {
  const res = await normalize('東京都江東区豊洲 １ー２ー２７')
  expect(res).toStrictEqual({ "pref": "東京都", "city": "江東区", "town": "豊洲一丁目", "addr": "2-27", "level": 3})
})

test('東京都町田市木曽東4丁目14-イ２２ ジオロニアマンション', async () => {
  const res = await normalize('東京都町田市木曽東四丁目１４ーイ２２ ジオロニアマンション')
  expect(res).toStrictEqual({"pref": "東京都", "city": "町田市", "town": "木曽東四丁目", "addr": "14-イ22 ジオロニアマンション", "level": 3})
})

test('東京都町田市木曽東4丁目14-Ａ２２ ジオロニアマンション', async () => {
  const res = await normalize('東京都町田市木曽東四丁目１４ーＡ２２ ジオロニアマンション')
  expect(res).toStrictEqual({"pref": "東京都", "city": "町田市", "town": "木曽東四丁目", "addr": "14-A22 ジオロニアマンション", "level": 3})
})

test('東京都町田市木曽東4丁目一四━Ａ二二 ジオロニアマンション', async () => {
  const res = await normalize('東京都町田市木曽東四丁目一四━Ａ二二 ジオロニアマンション')
  expect(res).toStrictEqual({"pref": "東京都", "city": "町田市", "town": "木曽東四丁目", "addr": "14-A22 ジオロニアマンション", "level": 3})
})

test('東京都江東区豊洲 一丁目2-27', async () => {
  const res = await normalize('東京都江東区豊洲 一丁目2-27')
  expect(res).toStrictEqual({ "pref": "東京都", "city": "江東区", "town": "豊洲一丁目", "addr": "2-27", "level": 3})
})

test('東京都江東区豊洲 四-2-27', async () => {
  const res = await normalize('東京都江東区豊洲 四-2-27')
  expect(res).toStrictEqual({ "pref": "東京都", "city": "江東区", "town": "豊洲四丁目", "addr": "2-27", "level": 3})
})

test('石川県七尾市藤橋町亥45番地1', async () => {
  const res = await normalize('石川県七尾市藤橋町亥45番地1')
  expect(res).toStrictEqual({ "pref": "石川県", "city": "七尾市", "town": "藤橋町", "addr": "亥45-1", "level": 3})
})

test('石川県七尾市藤橋町亥四十五番地1', async () => {
  const res = await normalize('石川県七尾市藤橋町亥四十五番地1')
  expect(res).toStrictEqual({ "pref": "石川県", "city": "七尾市", "town": "藤橋町", "addr": "亥45-1", "level": 3})
})

test('石川県七尾市藤橋町 亥 四十五番地1', async () => {
  const res = await normalize('石川県七尾市藤橋町 亥 四十五番地1')
  expect(res).toStrictEqual({ "pref": "石川県", "city": "七尾市", "town": "藤橋町", "addr": "亥45-1", "level": 3})
})

test('石川県七尾市藤橋町 亥 45-1', async () => {
  const res = await normalize('石川県七尾市藤橋町 亥 45-1')
  expect(res).toStrictEqual({ "pref": "石川県", "city": "七尾市", "town": "藤橋町", "addr": "亥45-1", "level": 3})
})

test('和歌山県和歌山市 七番丁19', async () => {
  const res = await normalize('和歌山県和歌山市 七番丁 19')
  expect(res).toStrictEqual({ "pref": "和歌山県", "city": "和歌山市", "town": "七番丁", "addr": "19", "level": 3})
})

test('和歌山県和歌山市7番町19', async () => {
  const res = await normalize('和歌山県和歌山市7番町19')
  expect(res).toStrictEqual({ "pref": "和歌山県", "city": "和歌山市", "town": "七番丁", "addr": "19", "level": 3})
})

test('和歌山県和歌山市十二番丁45', async () => {
  const res = await normalize('和歌山県和歌山市十二番丁45')
  expect(res).toStrictEqual({ "pref": "和歌山県", "city": "和歌山市", "town": "十二番丁", "addr": "45", "level": 3})
})

test('和歌山県和歌山市12番丁45', async () => {
  const res = await normalize('和歌山県和歌山市12番丁45')
  expect(res).toStrictEqual({ "pref": "和歌山県", "city": "和歌山市", "town": "十二番丁", "addr": "45", "level": 3})
})

test('和歌山県和歌山市12-45', async () => {
  const res = await normalize('和歌山県和歌山市12-45')
  expect(res).toStrictEqual({ "pref": "和歌山県", "city": "和歌山市", "town": "十二番丁", "addr": "45", "level": 3})
})

test('兵庫県宝塚市東洋町1番1号', async () => {
  const res = await normalize('兵庫県宝塚市東洋町1番1号')
  expect(res).toStrictEqual({ "pref": "兵庫県", "city": "宝塚市", "town": "東洋町", "addr": "1-1", "level": 3})
})

test('兵庫県宝塚市東洋町1番1号', async () => {
  const res = await normalize('兵庫県宝塚市東洋町1番1号')
  expect(res).toStrictEqual({ "pref": "兵庫県", "city": "宝塚市", "town": "東洋町", "addr": "1-1", "level": 3})
})

test('北海道札幌市中央区北三条西３丁目１－５６マルゲンビル３Ｆ', async () => {
  const res = await normalize('北海道札幌市中央区北三条西３丁目１－５６マルゲンビル３Ｆ')
  expect(res).toStrictEqual({ "pref": "北海道", "city": "札幌市中央区", "town": "北三条西三丁目", "addr": "1-56マルゲンビル3F", "level": 3})
})

test('北海道札幌市北区北２４条西６丁目１−１', async () => {
  const res = await normalize('北海道札幌市北区北２４条西６丁目１−１')
  expect(res).toStrictEqual({ "pref": "北海道", "city": "札幌市北区", "town": "北二十四条西六丁目", "addr": "1-1", "level": 3})
})
