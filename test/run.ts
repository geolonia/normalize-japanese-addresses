import { spec } from 'node:test/reporters'
import { run } from 'node:test'
import { finished } from 'node:stream/promises'
import path from 'node:path'
import { glob } from 'glob'

async function main(base: string, ...testNamePatterns: string[]) {
  const files = await glob(path.join('test', base, '**', '*.test.ts'))

  const stream = run({
    files,
    testNamePatterns,
  }).compose(spec).pipe(process.stdout)
  await finished(stream)
}

main(process.argv[2], ...process.argv.slice(3))
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
