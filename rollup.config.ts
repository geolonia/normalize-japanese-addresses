import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import pkg from './package.json'

export default [
  {
    input: 'src/main.ts',
    output: {
      file: './dist/bundle.js',
      name: 'normalize',
      format: 'umd',
    },
    plugins: [
      // A confusing fix to overwrite tsconfig.json.
      // Without those options Rollup exports declaration files in ./dist/dist/ or no declaration at all.
      // see https://github.com/rollup/plugins/issues/394
      typescript({ tsconfig: './tsconfig.json', declarationDir: './' }),
      resolve({ browser: true }),
      commonjs(),
    ],
  },
  {
    input: 'src/main.ts',
    external: ['@geolonia/japanese-numeral', 'isomorphic-unfetch', 'lru-cache'],
    output: { file: pkg.main, format: 'cjs' },
    plugins: [typescript()],
  },
  {
    input: 'src/main-local.ts',
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
