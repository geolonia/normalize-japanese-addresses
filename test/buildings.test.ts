import { normalize } from '../src/main'

import fs from 'fs'
import path from 'path'

const data = fs.readFileSync(path.join(path.dirname(__filename), '/buildings.csv'), {encoding: 'utf-8'}).split(/\n/)

const buildings = {}

for (let i = 0; i < data.length; i++) {
  const [address, building] = data[i].split(/,/)

  test(`${address}${building}`, async () => {
    const res = await normalize(`${address}${building}`)
    expect(res.building).toStrictEqual(building)
  })
}
