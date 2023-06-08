import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import pkg from './package.json'

export default [
  {
    input: 'src/main-browser.ts',
    output: {
      dir: 'dist',
      name: 'normalize',
      format: 'umd',
    },
    plugins: [typescript(), resolve({ browser: true }), commonjs()],
  },
  {
    input: 'src/main-node.ts',
    external: [
      '@geolonia/japanese-numeral',
      'isomorphic-unfetch',
      'lru-cache',
      'unzipper',
      'fs',
    ],
    output: { file: pkg.main, format: 'cjs' },
    plugins: [typescript()],
  },
  {
    input: 'src/main-es.ts',
    output: {
      dir: 'dist',
      name: 'normalize',
      format: 'esm',
    },
    plugins: [typescript(), resolve({ browser: true }), commonjs()],
  },
]
