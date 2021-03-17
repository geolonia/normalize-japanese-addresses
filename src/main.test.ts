import { normalize } from './main'

test('大阪府堺市北区新金岡町4丁1−8', async () => {
  const res = await normalize('大阪府堺市北区新金岡町4丁1−8')
  expect(res).toStrictEqual({"pref": "大阪府", "city": "堺市北区", "town": "新金岡町4丁", "addr": "1-8"})
})

test('大阪府堺市北区新金岡町４丁１ー８', async () => {
  const res = await normalize('大阪府堺市北区新金岡町４丁１ー８')
  expect(res).toStrictEqual({"pref": "大阪府", "city": "堺市北区", "town": "新金岡町4丁", "addr": "1-8"})
})

test('和歌山県串本町串本1234', async () => {
  const res = await normalize('和歌山県串本町串本1234')
  expect(res).toStrictEqual({"pref": "和歌山県", "city": "東牟婁郡串本町", "town": "串本", "addr": "1234"})
})

test('和歌山県東牟婁郡串本町串本1234', async () => {
  const res = await normalize('和歌山県東牟婁郡串本町串本1234')
  expect(res).toStrictEqual({"pref": "和歌山県", "city": "東牟婁郡串本町", "town": "串本", "addr": "1234"})
})

test('和歌山県東牟婁郡串本町串本一二三四', async () => {
  const res = await normalize('和歌山県東牟婁郡串本町串本一二三四')
  expect(res).toStrictEqual({"pref": "和歌山県", "city": "東牟婁郡串本町", "town": "串本", "addr": "1234"})
})

test('京都府京都市中京区寺町通御池上る上本能寺前町488番地', async () => {
  const res = await normalize(
    '京都府京都市中京区寺町通御池上る上本能寺前町488番地',
  )
  expect(res).toStrictEqual({"pref": "京都府", "city": "京都市中京区", "town": "上本能寺前町", "addr": "488"})
})

test('京都府京都市中京区上本能寺前町488', async () => {
  const res = await normalize('京都府京都市中京区上本能寺前町488')
  expect(res).toStrictEqual({"pref": "京都府", "city": "京都市中京区", "town": "上本能寺前町", "addr": "488"})
})

test('大阪府大阪市中央区大手前２-１', async () => {
  const res = await normalize('大阪府大阪市中央区大手前２-１')
  expect(res).toStrictEqual({"pref": "大阪府", "city": "大阪市中央区", "town": "大手前2丁目", "addr": "1"})
})

test('北海道札幌市西区二十四軒二条2丁目3番3号', async () => {
  const res = await normalize('北海道札幌市西区24-2-2-3-3')
  expect(res).toStrictEqual({"pref": "北海道", "city": "札幌市西区", "town": "24軒2条2丁目", "addr": "3-3"})
})

test('京都府京都市東山区大和大路2-537-1', async () => {
  const res = await normalize('京都府京都市東山区大和大路2-537-1')
  expect(res).toStrictEqual({"pref": "京都府", "city": "京都市東山区", "town": "大和大路2丁目", "addr": "537-1"})
})

test('京都府京都市東山区大和大路2丁目五百三十七-1', async () => {
  const res = await normalize('京都府京都市東山区大和大路2丁目五百三十七の1')
  expect(res).toStrictEqual({"pref": "京都府", "city": "京都市東山区", "town": "大和大路2丁目", "addr": "537-1"})
})

test('愛知県蒲郡市旭町17番1号', async () => {
  const res = await normalize('愛知県蒲郡市旭町17番1号')
  expect(res).toStrictEqual({"pref": "愛知県", "city": "蒲郡市", "town": "旭町", "addr": "17-1"})
})

test('北海道岩見沢市栗沢町万字寿町１−２', async () => {
  const res = await normalize('北海道岩見沢市栗沢町万字寿町１−２')
  expect(res).toStrictEqual({"pref": "北海道", "city": "岩見沢市", "town": "栗沢町万字寿町", "addr": "1-2"})
})

test('北海道久遠郡せたな町北檜山区北檜山１９３', async () => {
  const res = await normalize('北海道久遠郡せたな町北檜山区北檜山１９３')
  expect(res).toStrictEqual({"pref": "北海道", "city": "久遠郡せたな町", "town": "北檜山区北檜山", "addr": "193"})
})

test('京都府京都市中京区錦小路通大宮東入七軒町466', async () => {
  const res = await normalize('京都府京都市中京区錦小路通大宮東入七軒町466')
  expect(res).toStrictEqual({"pref": "京都府", "city": "京都市中京区", "town": "七軒町", "addr": "466"})
})

test('栃木県佐野市七軒町2201', async () => {
  const res = await normalize('栃木県佐野市七軒町2201')
  expect(res).toStrictEqual({"pref": "栃木県", "city": "佐野市", "town": "七軒町", "addr": "2201"})
})

test('京都府京都市東山区大和大路通三条下る東入若松町393', async () => {
  const res = await normalize(
    '京都府京都市東山区大和大路通三条下る東入若松町393',
  )
  expect(res).toStrictEqual({"pref": "京都府", "city": "京都市東山区", "town": "若松町", "addr": "393"})
})

test('長野県長野市長野東之門町2462', async () => {
  const res = await normalize('長野県長野市長野東之門町2462')
  expect(res).toStrictEqual({"pref": "長野県", "city": "長野市", "town": "長野", "addr": "東之門町2462"})
})

test('岩手県下閉伊郡普代村第１地割上村４３−２５', async () => {
  const res = await normalize('岩手県下閉伊郡普代村第１地割上村４３−２５')
  expect(res).toStrictEqual({"pref": "岩手県", "city": "下閉伊郡普代村", "town": "第1地割字上村", "addr": "43-25"})
})

test('岩手県花巻市下北万丁目１７４−１', async () => {
  const res = await normalize('岩手県花巻市下北万丁目１７４−１')
  expect(res).toStrictEqual({"pref": "岩手県", "city": "花巻市", "town": "下北万丁目", "addr": "174-1"})
})

test('岩手県花巻市十二丁目１１９２', async () => {
  const res = await normalize('岩手県花巻市十二丁目１１９２')
  expect(res).toStrictEqual({"pref": "岩手県", "city": "花巻市", "town": "12丁目", "addr": "1192"})
})

test('岩手県滝沢市後２６８−５６６', async () => {
  const res = await normalize('岩手県滝沢市後２６８−５６６')
  expect(res).toStrictEqual({"pref": "岩手県", "city": "滝沢市", "town": "後", "addr": "268-566"})
})

test('青森県五所川原市金木町喜良市千苅６２−８', async () => {
  const res = await normalize('青森県五所川原市金木町喜良市千苅６２−８')
  expect(res).toStrictEqual({"pref": "青森県", "city": "五所川原市", "town": "金木町喜良市", "addr": "千苅62-8"})
})

test('岩手県盛岡市盛岡駅西通２丁目９番地１号', async () => {
  const res = await normalize('岩手県盛岡市盛岡駅西通２丁目９番地１号')
  expect(res).toStrictEqual({"pref": "岩手県", "city": "盛岡市", "town": "盛岡駅西通2丁目", "addr": "9-1"})
})

test('岩手県盛岡市盛岡駅西通２丁目９の１', async () => {
  const res = await normalize('岩手県盛岡市盛岡駅西通２丁目９の１')
  expect(res).toStrictEqual({"pref": "岩手県", "city": "盛岡市", "town": "盛岡駅西通2丁目", "addr": "9-1"})
})

test('岩手県盛岡市盛岡駅西通２の９の１', async () => {
  const res = await normalize('岩手県盛岡市盛岡駅西通２の９の１')
  expect(res).toStrictEqual({"pref": "岩手県", "city": "盛岡市", "town": "盛岡駅西通2丁目", "addr": "9-1"})
})

test(' 東京都文京区千石4丁目15-7YNビル4階', async () => {
  const res = await normalize(' 東京都文京区千石4丁目15-7YNビル4階')
  expect(res).toStrictEqual({"pref": "東京都", "city": "文京区", "town": "千石4丁目", "addr": "15-7YNビル4階"})
})

test('東京都 文京区千石4丁目15-7YNビル4階', async () => {
  const res = await normalize('東京都 文京区千石4丁目15-7YNビル4階')
  expect(res).toStrictEqual({"pref": "東京都", "city": "文京区", "town": "千石4丁目", "addr": "15-7YNビル4階"})
})

test('東京都文京区 千石4丁目15-7YNビル4階', async () => {
  const res = await normalize('東京都文京区 千石4丁目15-7YNビル4階')
  expect(res).toStrictEqual({"pref": "東京都", "city": "文京区", "town": "千石4丁目", "addr": "15-7YNビル4階"})
})

test('東京都文京区千石4丁目15-7 YNビル4階', async () => {
  const res = await normalize('東京都文京区千石4丁目15-7 YNビル4階')
  expect(res).toStrictEqual({"pref": "東京都", "city": "文京区", "town": "千石4丁目", "addr": "15-7 YNビル4階"})
})

test('和歌山県東牟婁郡串本町串本 833', async () => {
  const res = await normalize('和歌山県東牟婁郡串本町串本 833')
  expect(res).toStrictEqual({"pref": "和歌山県", "city": "東牟婁郡串本町", "town": "串本", "addr": " 833"})
})

test('東京都世田谷区上北沢４の９の２', async () => {
  const res = await normalize('東京都世田谷区上北沢４の９の２')
  expect(res).toStrictEqual({"pref": "東京都", "city": "世田谷区", "town": "上北沢4丁目", "addr": "9-2"})
})
