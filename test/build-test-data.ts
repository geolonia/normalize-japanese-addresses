import { normalize } from '../src/main-node'
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'

const data = fs
  .readFileSync(path.join(path.dirname(__filename), '/list.txt'), {
    encoding: 'utf-8',
  })
  .split(/\n/)

;(async () => {
  data.sort()

  const output: string[][] = [
    [
      '住所',
      '都道府県',
      '市区町村',
      '町字',
      '番地号',
      'その他',
      'レベル',
      '位置情報レベル',
    ],
  ]
  for (const address of data) {
    if (!address) {
      continue
    }
    const result = await normalize(address)
    output.push([
      address,
      result.pref,
      result.city,
      result.town,
      result.addr || '',
      result.other,
      result.level.toString(),
      result.point ? result.point.level.toString() : '',
    ])
  }

  const csv = Papa.unparse(output, {
    header: true,
  })
  console.log(csv)
})()
