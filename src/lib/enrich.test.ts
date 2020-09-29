import enrich from './enrich'

describe('Tests for `src/lib/enrich.ts`.', () => {
  it('should get the code for "大阪府堺市北区新金岡町4丁1−8" as expected.', () => {
    const enriched: any = enrich('大阪府堺市北区新金岡町4丁1−8')
    expect(enriched.code).toEqual('271460084000')
  })

  it('should get the code for "大阪府大阪市北区梅田１丁目２" as expected.', () => {
    const enriched: any = enrich('大阪府大阪市北区梅田１丁目２')
    expect(enriched.code).toEqual('271270048001')
  })

  it('should get the code for "札幌市中央区北1条西2丁目" as expected.', () => {
    const enriched: any = enrich('札幌市中央区北1条西2丁目')
    expect(enriched.code).toEqual('011010013002')
  })

  it('should get the code for "札幌市中央区北一条西２丁目" as expected.', () => {
    const enriched: any = enrich('札幌市中央区北一条西２丁目')
    expect(enriched.code).toEqual('011010013002')
  })
})
