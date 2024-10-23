import { before, describe, test } from 'node:test'
import assert from 'node:assert'
import puppeteer from 'puppeteer'

import fs from 'node:fs/promises'
import path from 'node:path'

const runTest = (type: 'esm' | 'umd') => {
  return async () => {
    const browser = await puppeteer.launch({
      args: [
        '--disable-web-security', // for loading files from file://
      ],
    })
    try {
      const page = await browser.newPage()
      await page.goto(
        `file://${path.join(import.meta.dirname, `browser/index-${type}.html`)}`,
      )

      await Promise.race([
        page.waitForSelector('#result', { timeout: 20_000 }),
        page.waitForSelector('#error', { timeout: 20_000 }),
      ])

      const errorElem = await page.$$('#error')
      if (errorElem.length > 0) {
        const errorValue = await page.$eval('#error', (el) => el.textContent)
        assert.strictEqual(
          errorElem.length,
          0,
          `#error should not exist, instead we have: ${errorValue}`,
        )
      }

      const result = await page.$eval('#result', (el) => el.textContent)
      assert.strictEqual(result, 'OK')
    } finally {
      await browser.close()
    }
  }
}

describe(`browser`, { timeout: 60_000 }, () => {
  before(async () => {
    await fs.copyFile(
      path.join(import.meta.dirname, '../../dist/main-esm.mjs'),
      path.join(import.meta.dirname, 'browser/main-esm.mjs'),
    )
    await fs.copyFile(
      path.join(import.meta.dirname, '../../dist/main-umd.cjs'),
      path.join(import.meta.dirname, 'browser/main-umd.cjs'),
    )
  })

  test(`esm`, runTest('esm'))
  test(`umd`, runTest('umd'))
})
