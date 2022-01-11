import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import pkg from './package.json'

export default [
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      name: 'normalize',
      format: 'umd',
    },
    plugins: [typescript(), resolve({ browser: true }), commonjs()],
  },
  {
    input: 'src/index.ts',
    external: ['@geolonia/japanese-numeral', 'isomorphic-unfetch', 'lru-cache'],
    output: { file: pkg.main, format: 'cjs' },
    plugins: [typescript()],
  },
  {
    input: 'src/index-local.ts',
    external: [
      '@geolonia/japanese-numeral',
      'isomorphic-unfetch',
      'lru-cache',
      'fs',
      'path',
    ],
    output: {
      file: './dist/local.js',
      format: 'cjs',
    },
    plugins: [typescript()],
  },
]
