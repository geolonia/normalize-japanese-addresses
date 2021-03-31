import { normalize } from '../src/main'

import fs from 'fs'
import path from 'path'

const data = fs.readFileSync(path.join(path.dirname(__filename), '/buildings.csv'), {encoding: 'utf-8'}).split(/\n/)

for (let i = 0; i < data.length; i++) {
  const address = data[i].trim()
  if (! address) {
    continue
  }

  test(address, async () => {
    const res = await normalize(address)
    expect(!! res.pref).toStrictEqual(true)
    expect(!! res.city).toStrictEqual(true)
    expect(!! res.town).toStrictEqual(true)
    expect(!! res.addr).toStrictEqual(true)
  })
}
