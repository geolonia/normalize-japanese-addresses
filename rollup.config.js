import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default [
  {
    input: 'src/main-browser.ts',
    output: {
      file: './dist/main-browser-umd.js',
      name: 'normalize',
      format: 'umd',
    },
    plugins: [typescript(), resolve({ browser: true }), commonjs()],
  },
  {
    input: 'src/main-browser.ts',
    output: {
      file: './dist/main-browser-esm.js',
      name: 'normalize',
      format: 'esm',
    },
    plugins: [typescript(), resolve({ browser: true }), commonjs()],
  },
  {
    input: 'src/main-node.ts',
    external: [
      '@geolonia/japanese-numeral',
      'papaparse',
      'undici',
      'lru-cache',
      'unzipper',
      'node:fs',
    ],
    output: {
      file: './dist/main-node-esm.js',
      format: 'esm',
    },
    plugins: [typescript()],
  },
  {
    input: 'src/main-node.ts',
    external: [
      '@geolonia/japanese-numeral',
      'papaparse',
      'undici',
      'lru-cache',
      'unzipper',
      'node:fs',
    ],
    output: {
      file: './dist/main-node-cjs.cjs',
      format: 'cjs',
    },
    plugins: [typescript()],
  },
]
