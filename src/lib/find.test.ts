import util from './util'
import find from './find'

describe('Tests for `src/lib/find.js`.', () => {
  it('should find the address "大阪府大阪市中央区大手前２丁目１" as expected.', () => {
    const res: any = find(util.normalize('大阪府大阪市中央区大手前２丁目１'))
    expect(res.code).toEqual('271280058002')
    expect(res.tail).toEqual('１')
  })

  it('should find the address "大阪府堺市北区新金岡町4丁1−8" as expected.', () => {
    const res: any = find(util.normalize('大阪府堺市北区新金岡町4丁1−8'))
    expect(res.code).toEqual('271460084000')
    expect(res.tail).toEqual('1−8')
  })

  it('should find the address "京都市中京区上本能寺前町488番地" as expected.', () => {
    const res: any = find(util.normalize('京都市中京区上本能寺前町488番地'))
    expect(res.code).toEqual('261040098000')
    expect(res.tail).toEqual('488番地')
  })

  it('should find the address "京都市中京区寺町通御池上る上本能寺前町488番地" as expected.', () => {
    const res: any = find(
      util.normalize('京都市中京区寺町通御池上る上本能寺前町488番地'),
    )
    expect(res.code).toEqual('261040098000')
    expect(res.tail).toEqual('488番地')
  })

  it('should find the address "京都市中京区寺町通御池上る上本能寺前町" as expected.', () => {
    const res: any = find(
      util.normalize('京都市中京区寺町通御池上る上本能寺前町'),
    )
    expect(res.code).toEqual('261040098000')
    expect(res.tail).toEqual('')
  })

  it('should find the address "京都市東山区大和大路通三条下る東入若松町393" as expected.', () => {
    const res: any = find(
      util.normalize('京都市東山区大和大路通三条下る東入若松町393'),
    )
    expect(res.code).toEqual('261050212000')
    expect(res.tail).toEqual('393')
  })

  it('should find the address "京都府京都市東山区大和大路二丁目" as expected.', () => {
    const res: any = find(util.normalize('京都府京都市東山区大和大路二丁目'))
    expect(res.code).toEqual('261050202002')
    expect(res.tail).toEqual('')
  })

  it('should find the address "京都府京都市東山区大和大路通正面下る大和大路2-537-1" as expected.', () => {
    const res: any = find(
      util.normalize('京都府京都市東山区大和大路通正面下る大和大路2-537-1'),
    )
    expect(res.code).toEqual('261050202002')
    expect(res.tail).toEqual('537-1')
  })

  it('should find the address "京都府京都市東山区大和大路通正面下る大和大路2丁目537-1" as expected.', () => {
    const res: any = find(
      util.normalize('京都府京都市東山区大和大路通正面下る大和大路2丁目537-1'),
    )
    expect(res.code).toEqual('261050202002')
    expect(res.tail).toEqual('537-1')
  })

  it('should find the address "京都府京都市東山区大和大路2-537-1" as expected.', () => {
    const res: any = find(util.normalize('京都府京都市東山区大和大路2-537-1'))
    expect(res.code).toEqual('261050202002')
    expect(res.tail).toEqual('537-1')
  })

  it('should find the address "京都府京都市東山区大和大路2丁目" as expected.', () => {
    const res: any = find(util.normalize('京都府京都市東山区大和大路2丁目'))
    expect(res.code).toEqual('261050202002')
    expect(res.tail).toEqual('')
  })

  // https://github.com/geolonia/community-geocoder/issues/18
  it('should find the address "埼玉県所沢市上安松" as expected.', () => {
    const res: any = find(util.normalize('埼玉県所沢市上安松'))
    expect(res.code).toEqual('112080072000')
    expect(res.tail).toEqual('')
  })

  // https://github.com/geolonia/community-geocoder/issues/14
  it('should find the address "埼玉県比企郡鳩山町石坂" as expected.', () => {
    const res: any = find(util.normalize('埼玉県比企郡鳩山町石坂'))
    expect(res.code).toEqual('113480015000')
    expect(res.tail).toEqual('')
  })

  // https://github.com/geolonia/community-geocoder/issues/15
  it('should find the address "長野県松本市岡田松岡１６２－１" as expected.', () => {
    const res: any = find(util.normalize('長野県松本市岡田松岡１６２－１'))
    expect(res.code).toEqual('202020028000')
    expect(res.tail).toEqual('１６２－１')
  })

  // https://github.com/geolonia/community-geocoder/issues/15
  it('should find the address "長野県松本市大字岡田松岡１６２－１" as expected.', () => {
    const res: any = find(util.normalize('長野県松本市大字岡田松岡１６２－１'))
    expect(res.code).toEqual('202020028000')
    expect(res.tail).toEqual('１６２－１')
  })

  // https://github.com/geolonia/community-geocoder/issues/17
  it('should find the address "京都府舞鶴市余部下無番地" as expected.', () => {
    const res: any = find(util.normalize('京都府舞鶴市余部下無番地'))
    expect(res.code).toEqual('262020006000')
    expect(res.tail).toEqual('無番地')
  })

  // https://github.com/geolonia/community-geocoder/issues/20
  it('should find the address "札幌市西区二十四軒1条1丁目" as expected.', () => {
    const res: any = find(util.normalize('札幌市西区二十四軒1条1丁目'))
    expect(res.code).toEqual('011070023001')
    expect(res.tail).toEqual('')
  })

  // https://github.com/geolonia/community-geocoder/issues/20
  it('should find the address "札幌市西区24軒1条1丁目" as expected.', () => {
    const res: any = find(util.normalize('札幌市西区24軒1条1丁目'))
    expect(res.code).toEqual('011070023001')
    expect(res.tail).toEqual('')
  })

  // https://github.com/geolonia/community-geocoder/issues/37
  it('should find the address "京都府京都市下京区東松屋町" as expected.', () => {
    const res: any = find(util.normalize('京都府京都市下京区東松屋町'))
    expect(res.code).toEqual('261060423000')
    expect(res.tail).toEqual('')
  })

  // https://github.com/geolonia/community-geocoder/issues/37
  it('should find the address "京都府京都市下京区松屋町" as expected.', () => {
    const res: any = find(util.normalize('京都府京都市下京区松屋町'))
    expect(res.code).toEqual('261060465000')
    expect(res.tail).toEqual('')
  })

  // https://github.com/geolonia/community-geocoder/issues/37
  it('should find the address "京都府京都市下京区西松屋町" as expected.', () => {
    const res: any = find(util.normalize('京都府京都市下京区西松屋町'))
    expect(res.code).toEqual('261060381000')
    expect(res.tail).toEqual('')
  })

  // https://github.com/geolonia/community-geocoder/issues/34
  it('should find the address "新潟県新潟市中央区西湊町通1ノ町2692" as expected.', () => {
    const res: any = find(util.normalize('新潟県新潟市中央区西湊町通1ノ町2692'))
    expect(res.code).toEqual('151030181000')
    expect(res.tail).toEqual('2692')
  })

  // https://github.com/geolonia/community-geocoder/issues/33
  it('should find the address "新潟県新潟市中央区西堀通1番町771" as expected.', () => {
    const res: any = find(util.normalize('新潟県新潟市中央区西堀通1番町771'))
    expect(res.code).toEqual('151030161000')
    expect(res.tail).toEqual('771')
  })

  // https://github.com/geolonia/community-geocoder/issues/47
  it('should find the address "北海道上川郡東神楽町19号南2番地" as expected.', () => {
    const res: any = find(util.normalize('北海道上川郡東神楽町19号南2番地'))
    expect(res.code).toEqual('014530010000')
    expect(res.tail).toEqual('南2番地')
  })

  // https://github.com/geolonia/community-geocoder/issues/47
  it('should find the address "北海道上川郡東川町西三号北7番地" as expected.', () => {
    const res: any = find(util.normalize('北海道上川郡東川町西三号北7番地'))
    expect(res.code).toEqual('014580011000')
    expect(res.tail).toEqual('7番地')
  })

  // https://github.com/geolonia/community-geocoder/issues/30
  it('should find the address "旭川市神居2条10丁目" as expected.', () => {
    const res: any = find(util.normalize('旭川市神居2条10丁目'))
    expect(res.code).toEqual('012040074010')
    expect(res.tail).toEqual('')
  })

  // https://github.com/geolonia/community-geocoder/issues/30
  it('should find the address "旭川市神楽6条12丁目" as expected.', () => {
    const res: any = find(util.normalize('旭川市神楽6条12丁目'))
    expect(res.code).toEqual('012040053012')
    expect(res.tail).toEqual('')
  })

  // https://github.com/geolonia/community-geocoder/issues/30
  it('should find the address "旭川市5条通20丁目" as expected.', () => {
    const res: any = find(util.normalize('旭川市5条通20丁目'))
    expect(res.code).toEqual('012040010020')
    expect(res.tail).toEqual('')
  })

  // https://github.com/geolonia/community-geocoder/issues/30
  it('should find the address "旭川市錦町14丁目" as expected.', () => {
    const res: any = find(util.normalize('旭川市錦町14丁目'))
    expect(res.code).toEqual('012040241014')
    expect(res.tail).toEqual('')
  })

  it('should find the address "岩手県久慈市夏井町夏井第一地割36番地" as expected.', () => {
    const res: any = find(
      util.normalize('岩手県久慈市夏井町夏井第一地割36番地'),
    )
    expect(res.code).toEqual('032070032000')
    expect(res.tail).toEqual('夏井第一地割36番地')
  })

  // https://github.com/geolonia/community-geocoder/issues/67
  it('should find the address "山梨県北都留郡丹波山村" as expected.', () => {
    const res: any = find(util.normalize('山梨県北都留郡丹波山村'))
    expect(res.code).toEqual('19443')
    expect(res.tail).toEqual('')
  })

  // https://github.com/geolonia/community-geocoder/issues/76
  it('should find the address "埼玉市" as expected.', () => {
    const res: any = find(util.normalize('埼玉市'))
    expect(res).toEqual(null)
  })

  // https://github.com/geolonia/community-geocoder/issues/75
  it('should find the address "京都府宇治市六地藏1丁目" as expected.', () => {
    const res: any = find(util.normalize('京都府宇治市六地藏1丁目'))
    expect(res.code).toEqual('262040031001')
    expect(res.tail).toEqual('')
  })

  // https://github.com/geolonia/community-geocoder/issues/75
  it('should find the address "京都府宇治市六地藏２丁目" as expected.', () => {
    const res: any = find(util.normalize('京都府宇治市六地藏２丁目'))
    expect(res.code).toEqual('262040030000')
    expect(res.tail).toEqual('二丁目')
  })

  // https://github.com/geolonia/community-geocoder/issues/24
  it('should find the address "岡山県笠岡市大冝" as expected.', () => {
    const res: any = find(util.normalize('岡山県笠岡市大冝'))
    expect(res.code).toEqual('332050010000')
    expect(res.tail).toEqual('')
  })

  // https://github.com/geolonia/community-geocoder/issues/25
  it('should find the address "岡山県岡山市中区穝" as expected.', () => {
    const res: any = find(util.normalize('岡山県岡山市中区穝'))
    expect(res.code).toEqual('331020031000')
    expect(res.tail).toEqual('')
  })

  // https://github.com/geolonia/community-geocoder/issues/24
  it('should find the address "福岡県遠賀郡水巻町杁" as expected.', () => {
    const res: any = find(util.normalize('福岡県遠賀郡水巻町杁'))
    expect(res.code).toEqual('403820004002')
    expect(res.tail).toEqual('')
  })

  // https://github.com/geolonia/community-geocoder/issues/50
  it('should find the address "宮城県塩釜市旭町1-1" as expected.', () => {
    const res: any = find(util.normalize('宮城県塩釜市旭町1-1'))
    expect(res.code).toEqual('042030034000')
    expect(res.tail).toEqual('1-1')
  })

  // https://github.com/geolonia/community-geocoder/issues/50
  it('should find the address "長野県長野市東之門町" as expected.', () => {
    const res: any = find(util.normalize('長野県長野市東之門町'))
    expect(res.code).toEqual('202010060000')
    expect(res.tail).toEqual('東の門町') // 内部的に `之` を `の` に変換
  })

  // https://github.com/geolonia/community-geocoder/issues/60
  it('should find the address "東京都千代田区猿楽町" as expected.', () => {
    const res: any = find(util.normalize('東京都千代田区猿楽町'))
    expect(res.code).toEqual('131010047002')
    expect(res.tail).toEqual('') // 内部的に `之` を `の` に変換
  })

  // https://github.com/geolonia/community-geocoder/issues/60
  it('should find the address "千代田区三崎町" as expected.', () => {
    const res: any = find(util.normalize('千代田区三崎町'))
    expect(res.code).toEqual('131010049003')
    expect(res.tail).toEqual('') // 内部的に `之` を `の` に変換
  })

  // https://github.com/geolonia/community-geocoder/issues/60
  it('should find the address "東京都千代田区神田猿楽町" as expected.', () => {
    const res: any = find(util.normalize('東京都千代田区神田猿楽町'))
    expect(res.code).toEqual('131010047002')
    expect(res.tail).toEqual('') // 内部的に `之` を `の` に変換
  })

  // https://github.com/geolonia/community-geocoder/issues/60
  it('should find the address "千代田区神田三崎町" as expected.', () => {
    const res: any = find(util.normalize('千代田区神田三崎町'))
    expect(res.code).toEqual('131010049003')
    expect(res.tail).toEqual('') // 内部的に `之` を `の` に変換
  })
})
