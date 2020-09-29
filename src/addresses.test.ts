import fs from 'fs'
import path from 'path'

import util from './lib/util'
import find from './lib/find'

const addresses = fs
  .readFileSync(path.join(path.dirname(__filename), '/addresses.test.txt'), {
    encoding: 'utf-8',
  })
  .split(/\n/)

test.each(addresses)('Tests for `src/lib/find.js` with %s', (address) => {
  const res: any = find(util.normalize(address))
  expect(res.code.length).toBe(12)
})
