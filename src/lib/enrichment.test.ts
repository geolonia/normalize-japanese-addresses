import enrichment from './enrichment'

describe('Tests for `src/lib/enrich.ts`.', () => {
  it('should get the code for "大阪府堺市北区新金岡町4丁1−8" as expected.', () => {
    const enriched: any = enrichment('大阪府堺市北区新金岡町4丁1−8')
    expect(enriched.address).toEqual('大阪府堺市北区新金岡町四丁1−8')
    expect(enriched.code).toEqual('271460084000')
    expect(enriched.tail).toEqual('1−8')
  })

  it('should get the code for "大阪府大阪市北区梅田１丁目２" as expected.', () => {
    const enriched: any = enrichment('大阪府大阪市北区梅田１丁目２')
    expect(enriched.code).toEqual('271270048001')
    expect(enriched.tail).toEqual('２')
  })

  it('should get the code for "札幌市中央区北1条西2丁目" as expected.', () => {
    const enriched: any = enrichment('札幌市中央区北1条西2丁目')
    expect(enriched.code).toEqual('011010013002')
  })

  it('should get the code for "札幌市中央区北一条西２丁目" as expected.', () => {
    const enriched: any = enrichment('札幌市中央区北一条西２丁目')
    expect(enriched.code).toEqual('011010013002')
  })
})
