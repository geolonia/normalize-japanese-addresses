import { describe, test } from 'node:test'
import assert from 'node:assert'

import { promisify } from 'node:util'
import { exec as execCb } from 'node:child_process'
import path from 'node:path'

const exec = promisify(execCb);

describe(`webpack with TS`, { timeout: 60_000 }, () => {
  test(`build & run`, async () => {
    const cwd = path.join(import.meta.dirname, `webpack-ts`);
    await exec(`npm install`, { cwd });
    await exec(`npm run build`, { cwd });
    const res = await exec(`node ./dist/bundle.js`, { cwd });

    assert.strictEqual(res.stdout.trim(), 'OK');
    assert.strictEqual(res.stderr, '');
  });
});
