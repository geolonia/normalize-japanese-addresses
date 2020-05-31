#!/usr/bin/env node

const glob = require("glob")
const fs = require("fs")
const path = require("path")
const unzip= require('unzipper')
const Encoding = require('encoding-japanese')
const https = require('https')
const parse = require('csv-parse/lib/sync')

const apiDir = path.join(path.dirname(path.dirname(__filename)), 'docs', 'api')
const dataDir = path.join(path.dirname(path.dirname(__filename)), 'data')

for (let i = 1; i < 48; i++) {
  let prefCode = i.toString()
  if (i < 10) {
    prefCode = `0${prefCode}`
  }

  const url = `https://nlftp.mlit.go.jp/isj/dls/data/11.0b/${prefCode}000-11.0b.zip`
  const fileName = `${dataDir}/${prefCode}.zip`
  const file = fs.createWriteStream(fileName)

  https.get(url, (res) => {
    res.pipe(file);
    res.on('end', () => {
      file.close();

      const dir = path.join(dataDir, `${prefCode}000-11.0b`)
      fs.createReadStream(fileName).pipe(unzip.Extract({ path: dataDir }))
      const csvFile = `${dir}/${prefCode}_2017.csv`

      setTimeout(() => {
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
          const json = JSON.stringify({
            addr: `${line['都道府県名']}${line['市区町村名']}${line['大字町丁目名']}`,
            lat: line['緯度'],
            lng: line['経度'],
          })

          try {
            const stats = fs.statSync(dir)
            if (stats.isDirectory()) {
              fs.writeFileSync(path.join(dir, `${line['大字町丁目コード']}.json`), json)
            } else {
              throw new Error()
            }
          } catch(e) {
            fs.mkdirSync(dir, {recursive: true})
            // This is the default endpoint for the city.
            fs.writeFileSync(path.join(dir, `${line['市区町村コード']}.json`), json)
            fs.writeFileSync(path.join(dir, `${line['大字町丁目コード']}.json`), json)
          }
        })
      }, 2000)
    })
  })
}
