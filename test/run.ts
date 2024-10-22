import { spec as specReporter } from 'node:test/reporters';
import { run } from 'node:test';
import process from 'node:process';
import { finished } from 'node:stream/promises';
import path from 'node:path';
import { glob } from 'glob';

async function main(base: string, ...testNamePatterns: string[]) {
  const files = await glob(path.join('test', base, '**', '*.test.ts'), {
    absolute: true,
  });
  const testStream = run({
    files,
    testNamePatterns,
  });
  testStream.on('test:fail', () => {
    process.exitCode = 1
  });
  const outStream = testStream.compose(new specReporter()).pipe(process.stdout);
  await finished(outStream);
}

main(process.argv[2], ...process.argv.slice(3))
  .then(() => {
    process.exit()
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
