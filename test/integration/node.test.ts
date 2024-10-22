import { describe, test } from 'node:test'
import assert from 'node:assert'

import { promisify } from 'node:util'
import { exec as execCb } from 'node:child_process'
import path from 'node:path'

const exec = promisify(execCb);

const runTest = (type: 'cjs' | 'esm') => {
  return async () => {
    // the test project is in ./node-${type}
    const cwd = path.join(import.meta.dirname, `node-${type}`);
    await exec(`npm install`, { cwd });
    const res = await exec(`node ./index.js`, { cwd });

    assert.strictEqual(res.stdout.trim(), 'OK');
    assert.strictEqual(res.stderr, '');
  }
}

describe(`node`, () => {
  test(`cjs`, runTest('cjs'));
  test(`esm`, runTest('esm'));
});
