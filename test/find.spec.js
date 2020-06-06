import chai from 'chai';
const assert = chai.assert;

import util from '../src/imi-enrichment-address/lib/util'
import find from '../src/imi-enrichment-address/lib/find'

describe('Tests for `src/imi-enrichment-address/lib/find.js`.', () => {
  it('should find the address "大阪府大阪市中央区大手前２丁目１" as expected.', () => {
    const res = find(util.normalize("大阪府大阪市中央区大手前２丁目１"))
    assert.deepEqual('271280058002', res.code)
    assert.deepEqual('１', res.tail)
  });

  it('should find the address "大阪府堺市北区新金岡町4丁1−8" as expected.', () => {
    const res = find(util.normalize("大阪府堺市北区新金岡町4丁1−8"))
    assert.deepEqual('271460084000', res.code)
    assert.deepEqual('1−8', res.tail)
  });

  it('should find the address "京都市中京区上本能寺前町488番地" as expected.', () => {
    const res = find(util.normalize("京都市中京区上本能寺前町488番地"))
    assert.deepEqual('261040098000', res.code)
    assert.deepEqual('488番地', res.tail)
  });

  it('should find the address "京都市中京区寺町通御池上る上本能寺前町488番地" as expected.', () => {
    const res = find(util.normalize("京都市中京区寺町通御池上る上本能寺前町488番地"))
    assert.deepEqual('261040098000', res.code)
    assert.deepEqual('488番地', res.tail)
  });

  it('should find the address "京都市中京区寺町通御池上る上本能寺前町" as expected.', () => {
    const res = find(util.normalize("京都市中京区寺町通御池上る上本能寺前町"))
    assert.deepEqual('261040098000', res.code)
    assert.deepEqual('', res.tail)
  });

  it('should find the address "京都市東山区大和大路通三条下る東入若松町393" as expected.', () => {
    const res = find(util.normalize("京都市東山区大和大路通三条下る東入若松町393"))
    assert.deepEqual('261050212000', res.code)
    assert.deepEqual('393', res.tail)
  });

  it('should find the address "京都府京都市東山区大和大路二丁目" as expected.', () => {
    const res = find(util.normalize("京都府京都市東山区大和大路二丁目"))
    assert.deepEqual('261050202002', res.code)
    assert.deepEqual('', res.tail)
  });

  it('should find the address "京都府京都市東山区大和大路通正面下る大和大路2-537-1" as expected.', () => {
    const res = find(util.normalize("京都府京都市東山区大和大路通正面下る大和大路2-537-1"))
    assert.deepEqual('261050202002', res.code)
    assert.deepEqual('2-537-1', res.tail)
  });

  // https://github.com/geolonia/community-geocoder/issues/18
  it('should find the address "埼玉県所沢市上安松" as expected.', () => {
    const res = find(util.normalize("埼玉県所沢市上安松"))
    assert.deepEqual('112080072000', res.code)
    assert.deepEqual('', res.tail)
  });

  // https://github.com/geolonia/community-geocoder/issues/14
  it('should find the address "埼玉県比企郡鳩山町石坂" as expected.', () => {
    const res = find(util.normalize("埼玉県比企郡鳩山町石坂"))
    assert.deepEqual('113480015000', res.code)
    assert.deepEqual('', res.tail)
  });

  // https://github.com/geolonia/community-geocoder/issues/15
  it('should find the address "長野県松本市岡田松岡１６２－１" as expected.', () => {
    const res = find(util.normalize("長野県松本市岡田松岡１６２－１"))
    assert.deepEqual('202020028000', res.code)
    assert.deepEqual('１６２－１', res.tail)
  });

  // https://github.com/geolonia/community-geocoder/issues/15
  it('should find the address "長野県松本市大字岡田松岡１６２－１" as expected.', () => {
    const res = find(util.normalize("長野県松本市大字岡田松岡１６２－１"))
    assert.deepEqual('202020028000', res.code)
    assert.deepEqual('１６２－１', res.tail)
  });

  // https://github.com/geolonia/community-geocoder/issues/17
  it('should find the address "京都府舞鶴市余部下無番地" as expected.', () => {
    const res = find(util.normalize("京都府舞鶴市余部下無番地"))
    assert.deepEqual('262020006000', res.code)
    assert.deepEqual('無番地', res.tail)
  });

  // https://github.com/geolonia/community-geocoder/issues/20
  it('should find the address "札幌市西区二十四軒1条1丁目" as expected.', () => {
    const res = find(util.normalize("札幌市西区二十四軒1条1丁目"))
    assert.deepEqual('011070023001', res.code)
    assert.deepEqual('', res.tail)
  });

  // https://github.com/geolonia/community-geocoder/issues/20
  it('should find the address "札幌市西区24軒1条1丁目" as expected.', () => {
    const res = find(util.normalize("札幌市西区24軒1条1丁目"))
    assert.deepEqual('011070023001', res.code)
    assert.deepEqual('', res.tail)
  });

  // https://github.com/geolonia/community-geocoder/issues/37
  it('should find the address "京都府京都市下京区東松屋町" as expected.', () => {
    const res = find(util.normalize("京都府京都市下京区東松屋町"))
    assert.deepEqual('261060423000', res.code)
    assert.deepEqual('', res.tail)
  });

  // https://github.com/geolonia/community-geocoder/issues/37
  it('should find the address "京都府京都市下京区松屋町" as expected.', () => {
    const res = find(util.normalize("京都府京都市下京区松屋町"))
    assert.deepEqual('261060465000', res.code)
    assert.deepEqual('', res.tail)
  });

  // https://github.com/geolonia/community-geocoder/issues/37
  it('should find the address "京都府京都市下京区西松屋町" as expected.', () => {
    const res = find(util.normalize("京都府京都市下京区西松屋町"))
    assert.deepEqual('261060381000', res.code)
    assert.deepEqual('', res.tail)
  });
})
