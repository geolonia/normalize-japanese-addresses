import chai from 'chai';
const assert = chai.assert;

import util from '../src/imi-enrichment-address/lib/util'

describe('Tests for `src/imi-enrichment-address/lib/util.js`.', () => {
  it('should normalize address "大阪府堺市北区新金岡町4丁1−8".', () => {
    const normalized = util.normalize("大阪府堺市北区新金岡町4丁1−8")
    assert.deepEqual("大阪府堺市北区新金岡町四丁1−8", normalized)
  });

  it('should normalize address "大阪府堺市北区新金岡町26丁1−8".', () => {
    const normalized = util.normalize("大阪府堺市北区新金岡町26丁1−8")
    assert.deepEqual("大阪府堺市北区新金岡町二十六丁1−8", normalized)
  });

  it('should normalize address "大阪府堺市北区新金岡町２６丁１−８".', () => {
    const normalized = util.normalize("大阪府堺市北区新金岡町26丁１−８")
    assert.deepEqual("大阪府堺市北区新金岡町二十六丁１−８", normalized)
  });

  it('should normalize address "札幌市中央区北1条西2丁目".', () => {
    const normalized = util.normalize("札幌市中央区北1条西2丁目")
    assert.deepEqual("札幌市中央区北一条西二丁目", normalized)
  });

  it('should normalize address "札幌市中央区北２１条西2丁目".', () => {
    const normalized = util.normalize("札幌市中央区北２１条西2丁目")
    assert.deepEqual("札幌市中央区北二十一条西二丁目", normalized)
  });

  it('should normalize address "大阪府大阪市北区梅田１丁目２".', () => {
    const normalized = util.normalize("大阪府大阪市北区梅田１丁目２")
    assert.deepEqual("大阪府大阪市北区梅田一丁目２", normalized)
  });
  it('should normalize address "北海道上川郡鷹栖町9線6号".', () => {
    const normalized = util.normalize("北海道上川郡鷹栖町9線6号")
    assert.deepEqual("北海道上川郡鷹栖町九線6号", normalized)
  })
})
