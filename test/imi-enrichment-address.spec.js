import chai from 'chai';
const assert = chai.assert;

import enrichment from '../src/imi-enrichment-address/main'

describe('Tests for `src/imi-enrichment-address/lib/util.js`.', () => {
  it('should get the code for "大阪府堺市北区新金岡町4丁1−8" as expected.', () => {
    assert.deepEqual('271460084000', enrichment("大阪府堺市北区新金岡町4丁1−8"))
  });

  it('should get the code for "大阪府大阪市北区梅田１丁目２" as expected.', () => {
    assert.deepEqual('271270048001', enrichment("大阪府大阪市北区梅田１丁目２"))
  });

  it('should get the code for "札幌市中央区北1条西2丁目" as expected.', () => {
    assert.deepEqual('011010013002', enrichment("札幌市中央区北1条西2丁目"))
  });

  it('should get the code for "札幌市中央区北一条西２丁目" as expected.', () => {
    assert.deepEqual('011010013002', enrichment("札幌市中央区北一条西２丁目"))
  });
})
