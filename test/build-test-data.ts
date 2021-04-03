import { normalize } from '../src/main'
import fs from 'fs'
import path from 'path'

console.log('住所,都道府県,市区町村,町丁目,その他')

const data = fs.readFileSync(path.join(path.dirname(__filename), '/list.txt'), {encoding: 'utf-8'}).split(/\n/)

const lines = []

for (let i = 0; i < data.length; i++) {
  const address = data[i].trim()
  if (! address) {
    continue
  }

  normalize(address).then(result => {
    const line = [
      address,
      result.pref,
      result.city,
      result.town,
      result.addr
    ].join(',')

    console.log(line)
  })
}
