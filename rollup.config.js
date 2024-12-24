import fs from 'node:fs'
import path from 'node:path'

import typescript from '@rollup/plugin-typescript'
import { dts } from 'rollup-plugin-dts'
import del from 'rollup-plugin-delete'
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
    input: 'src/main.ts',
    output: {
      file: './dist/main-umd.cjs',
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
    input: 'src/main.ts',
    output: {
      file: './dist/main-esm.mjs',
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
  {
    input: 'dist/main.d.ts',
    output: [
      {
        file: './dist/main.d.ts',
        format: 'es',
      },
    ],
    plugins: [dts()],
  },
  {
    input: 'dist/main-node.d.ts',
    output: [
      {
        file: './dist/main-node.d.ts',
        format: 'es',
      },
    ],
    plugins: [
      dts(),
      del({
        targets: ['dist/**/*.d.ts', '!dist/main.d.ts', '!dist/main-node.d.ts'],
        hook: 'buildEnd',
      }),
    ],
  },
]
