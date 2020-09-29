import enrichment from '../src/main'

describe('Tests for `src/main.js`.', () => {
  it('should get the code for "大阪府堺市北区新金岡町4丁1−8" as expected.', () => {
    expect(enrichment('大阪府堺市北区新金岡町4丁1−8')).toEqual('271460084000')
  })

  it('should get the code for "大阪府大阪市北区梅田１丁目２" as expected.', () => {
    expect(enrichment('大阪府大阪市北区梅田１丁目２')).toEqual('271270048001')
  })

  it('should get the code for "札幌市中央区北1条西2丁目" as expected.', () => {
    expect(enrichment('札幌市中央区北1条西2丁目')).toEqual('011010013002')
  })

  it('should get the code for "札幌市中央区北一条西２丁目" as expected.', () => {
    expect(enrichment('札幌市中央区北一条西２丁目')).toEqual('011010013002')
  })
})
