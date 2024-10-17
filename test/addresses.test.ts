import { describe, test } from 'node:test'
import assert from 'node:assert'

import { normalize } from '../src/main-node'

import fs from 'node:fs'
import path from 'node:path'
import Papa from 'papaparse'
import { toMatchCloseTo } from 'jest-matcher-deep-close-to'
import { NormalizeResult } from '../src/types'

function assertMatchCloseTo(
  received: NormalizeResult,
  expected: NormalizeResult,
) {
  const result = toMatchCloseTo(received, expected)
  assert.ok(result.pass, result.message())
}

const input = fs.readFileSync(
  path.join(import.meta.dirname, '/addresses.csv'),
  {
    encoding: 'utf-8',
  },
)
const lines = Papa.parse<string[]>(input).data

describe(`address tests`, { concurrency: 4 }, () => {
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
      assertMatchCloseTo(res, match)
    })
  }
})
