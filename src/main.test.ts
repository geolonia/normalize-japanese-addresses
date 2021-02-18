import { normalize } from './main'

test('大阪府堺市北区新金岡町4丁1−8', async () => {
  const res = await normalize('大阪府堺市北区新金岡町4丁1−8')
  expect(res).toBe('大阪府堺市北区新金岡町4丁1−8')
})

test('大阪府堺市北区新金岡町４丁１ー８', async () => {
  const res = await normalize('大阪府堺市北区新金岡町４丁１ー８')
  expect(res).toBe('大阪府堺市北区新金岡町4丁1-8')
})

test('和歌山県串本町串本1234', async () => {
  const res = await normalize('和歌山県串本町串本1234')
  expect(res).toBe('和歌山県東牟婁郡串本町串本1234')
})

test('和歌山県東牟婁郡串本町串本1234', async () => {
  const res = await normalize('和歌山県東牟婁郡串本町串本1234')
  expect(res).toBe('和歌山県東牟婁郡串本町串本1234')
})

test('和歌山県東牟婁郡串本町串本一二三四', async () => {
  const res = await normalize('和歌山県東牟婁郡串本町串本一二三四')
  expect(res).toBe('和歌山県東牟婁郡串本町串本1234')
})

test('京都府京都市中京区寺町通御池上る上本能寺前町488番地', async () => {
  const res = await normalize(
    '京都府京都市中京区寺町通御池上る上本能寺前町488番地',
  )
  expect(res).toBe('京都府京都市中京区上本能寺前町488番地')
})

test('大阪府大阪市中央区大手前２-１', async () => {
  const res = await normalize(
    '大阪府大阪市中央区大手前２-１',
  )
  expect(res).toBe('大阪府大阪市中央区大手前2丁目1')
})

test('北海道札幌市西区二十四軒二条2丁目3番3号', async () => {
  const res = await normalize(
    '北海道札幌市西区24-2-2-3-3',
  )
  expect(res).toBe('北海道札幌市西区24軒2条2丁目3-3')
})

test('京都府京都市東山区大和大路2-537-1', async () => {
  const res = await normalize(
    '京都府京都市東山区大和大路2-537-1',
  )
  expect(res).toBe('京都府京都市東山区大和大路2丁目537-1')
})

