#!/usr/bin/env node

const glob = require("glob")
const fs = require("fs")
const path = require("path")
const unzip= require('unzipper')
const Encoding = require('encoding-japanese')
const parse = require('csv-parse/lib/sync')

const apiDir = path.join(path.dirname(path.dirname(__filename)), 'docs', 'api')
const dataDir = path.join(path.dirname(path.dirname(__filename)), 'data')
const files = glob.sync(`${dataDir}/*-11.0b.zip`)

files.forEach((item) => {
  const dir = path.join(dataDir, path.basename(item, '.zip'))
  fs.createReadStream(item).pipe(unzip.Extract({ path: dataDir }))
  const csvFile = glob.sync(`${dir}/*.csv`)[0]
  const buffer = fs.readFileSync(csvFile)
  const text = Encoding.convert(buffer, {
    from: 'SJIS',
    to: 'UNICODE',
    type: 'string',
  })

  const data = parse(text, {
    columns: true,
    skip_empty_lines: true
  })

  data.forEach((line) => {
    const dir = path.join(apiDir, line['都道府県コード'], line['市区町村コード'])
    try {
      const stats = fs.statSync(dir)
      if (stats.isDirectory()) {
        fs.writeFileSync(path.join(dir, `${line['大字町丁目コード']}.json`), JSON.stringify({
          lat: line['緯度'],
          lng: line['経度'],
        }))
      } else {
        throw new Error()
      }
    } catch(e) {
      fs.mkdirSync(dir, {recursive: true})
      // This is an default endpoint for the city.
      fs.writeFileSync(path.join(dir, `${line['市区町村コード']}.json`), JSON.stringify({
        lat: line['緯度'],
        lng: line['経度'],
      }))
      fs.writeFileSync(path.join(dir, `${line['大字町丁目コード']}.json`), JSON.stringify({
        lat: line['緯度'],
        lng: line['経度'],
      }))
    }
  })
})
