import fs from 'node:fs'
import path from 'node:path'

import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import replace from '@rollup/plugin-replace'

const packageJson = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, 'package.json'), 'utf-8'),
)

const replacePlugin = replace({
  preventAssignment: true,
  values: {
    __VERSION__: `'${packageJson.version}'`,
  },
})

export default [
  {
    input: 'src/main-browser.ts',
    output: {
      file: './dist/main-browser-umd.js',
      name: 'normalize',
      format: 'umd',
      sourcemap: true,
    },
    plugins: [
      typescript(),
      replacePlugin,
      resolve({ browser: true }),
      commonjs(),
      terser(),
    ],
  },
  {
    input: 'src/main-browser.ts',
    output: {
      file: './dist/main-browser-esm.mjs',
      name: 'normalize',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      typescript(),
      replacePlugin,
      resolve({ browser: true }),
      commonjs(),
      terser(),
    ],
  },
  {
    input: 'src/main-node.ts',
    external: [
      '@geolonia/japanese-numeral',
      '@geolonia/japanese-addresses-v2',
      'papaparse',
      'undici',
      'lru-cache',
      'node:fs',
    ],
    output: {
      file: './dist/main-node-esm.mjs',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [typescript(), replacePlugin],
  },
  {
    input: 'src/main-node.ts',
    external: [
      '@geolonia/japanese-numeral',
      '@geolonia/japanese-addresses-v2',
      'papaparse',
      'undici',
      'lru-cache',
      'node:fs',
    ],
    output: {
      file: './dist/main-node-cjs.cjs',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [typescript(), replacePlugin],
  },
]
