import { normalize } from '../src/main-node'
import fs from 'node:fs'
import path from 'node:path'
import Papa from 'papaparse'

const list = fs.readFileSync(path.join(import.meta.dirname, 'list.txt'), {
  encoding: 'utf-8',
})
const data = Papa.parse<string[]>(list).data

;(async () => {
  // data.sort()

  const addedAddresses: Set<string> = new Set()

  const output: string[][] = [
    [
      '住所',
      '都道府県',
      '市区町村',
      '町字',
      '番地号',
      'その他',
      'レベル',
      '緯度経度',
      '位置情報レベル',
      '備考',
    ],
  ]
  for (const line of data) {
    const address = line[0]
    if (!address) {
      continue
    }
    if (addedAddresses.has(address)) {
      throw new Error(
        `重複の入力住所: ${address} 重複を除き再試行してください。`,
      )
    }
    addedAddresses.add(address)

    const result = await normalize(address)
    output.push([
      address,
      result.pref || '',
      result.city || '',
      result.town || '',
      result.addr || '',
      result.other,
      result.level.toString(),
      result.point ? `${result.point.lng},${result.point.lat}` : '',
      result.point ? result.point.level.toString() : '',
      line[1] || '',
    ])
  }

  const csv = Papa.unparse(output, {
    header: true,
  })
  console.log(csv)
})()
