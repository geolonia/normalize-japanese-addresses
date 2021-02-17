import { normalize } from './main'

test('大阪府堺市北区新金岡町4丁1−8', async () => {
  const res = await normalize('大阪府堺市北区新金岡町4丁1−8')
  expect(res).toBe('大阪府堺市北区新金岡町4丁1−8')
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
