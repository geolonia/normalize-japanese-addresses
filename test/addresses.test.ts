import { normalize } from '../src/main-node'

import fs from 'node:fs'
import path from 'path'
import Papa from 'papaparse'
import { toMatchCloseTo } from 'jest-matcher-deep-close-to'
import { NormalizeResult } from '../src/types'

expect.extend({ toMatchCloseTo })

const input = fs.readFileSync(
  path.join(path.dirname(__filename), '/addresses.csv'),
  {
    encoding: 'utf-8',
  },
)
const lines = Papa.parse<string[]>(input).data

describe(`address tests`, () => {
  for (const line of lines) {
    const addr = line[0]
    if (addr === '住所') {
      continue
    }

    let testName = addr
    if (line[9] !== '') {
      testName += ` (${line[9]})`
    }

    test(testName, async () => {
      const res = await normalize(addr)
      const point = line[7] ? line[7].split(',').map(parseFloat) : undefined
      const match: NormalizeResult = {
        other: line[5],
        level: parseInt(line[6]),
      }
      if (line[1] !== '') match.pref = line[1]
      if (line[2] !== '') match.city = line[2]
      if (line[3] !== '') match.town = line[3]
      if (line[4] !== '') match.addr = line[4]
      if (point) {
        match.point = {
          lng: point[0],
          lat: point[1],
          level: parseInt(line[8]),
        }
      }
      expect(res).toMatchCloseTo(match)
    })
  }
})
