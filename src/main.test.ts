import { normalize } from './main'

test('大阪府堺市北区新金岡町4丁1−8', async () => {
  const res = await normalize('大阪府堺市北区新金岡町4丁1−8')
  expect(res).toBe('大阪府堺市北区新金岡町4丁1−8');
});

test('和歌山県串本町串本1234', async () => {
  const res = await normalize('和歌山県串本町串本1234')
  expect(res).toBe('和歌山県東牟婁郡串本町串本1234');
});

test('和歌山県東牟婁郡串本町串本1234', async () => {
  const res = await normalize('和歌山県東牟婁郡串本町串本1234')
  expect(res).toBe('和歌山県東牟婁郡串本町串本1234');
});

