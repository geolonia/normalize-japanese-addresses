import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { requestHandlers } from '../../src/main-node'

describe('file URL paths', () => {
  for (const name of ['住所#1.json', '住所%23.json', '住所 1.json']) {
    test(`reads ${name}`, async () => {
      const dir = await mkdtemp(join(tmpdir(), 'normalize-file-url-'))
      try {
        const path = join(dir, name)
        await writeFile(path, JSON.stringify({ name }))
        const response = await requestHandlers.file(pathToFileURL(path))
        assert.equal(response.ok, true)
        assert.deepEqual(await response.json(), { name })
      } finally {
        await rm(dir, { recursive: true, force: true })
      }
    })
  }
})
