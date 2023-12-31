import { babel } from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import typescript2 from 'rollup-plugin-typescript2';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';
import postcss from 'rollup-plugin-postcss';
import pkg from './package.json' assert { type: 'json' };
import tsc from './tsconfig.json' assert { type: 'json' };
// Utils
import { resolve } from 'path';
import { __dirname, postcsssPlugins } from './options.js';

const extensions = ['.ts', '.js', '.es', '.es6', '.mjs'];
const aliasPlugin = alias({
  entries: [
    { find: '@/', replacement: resolve(__dirname, 'src/') },
    { find: '@t/', replacement: resolve(__dirname, 'types/') },
  ],
});

/** @type {import('rollup').RollupOptions[]} */
export default [
  {
    input: 'src/style/index.css',
    output: {
      file: 'dist/hui-grid.css',
      format: 'es',
    },
    plugins: [
      postcss({
        include: '**/*.css',
        extract: true,
        plugins: postcsssPlugins,
        minimize: false,
      }),
    ],
  },
  {
    input: './src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [
      aliasPlugin,
      dts({
        compilerOptions: {
          baseUrl: tsc.compilerOptions.baseUrl,
          paths: tsc.compilerOptions.paths,
        },
      }),
    ],
  },
  {
    input: './src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: false,
      },
    ],
    plugins: [
      aliasPlugin,
      json(),
      nodeResolve({ extensions }),
      commonjs({ include: 'node_modules/**' }),
      terser(),
      typescript2({
        useTsconfigDeclarationDir: true,
        tsconfig: 'tsconfig.json',
        clean: true,
      }),
      babel({
        babelHelpers: 'runtime',
        presets: [
          [
            '@babel/preset-env',
            {
              useBuiltIns: 'usage',
              corejs: '3.33.3',
              targets: '> 0.25%, not dead',
            },
          ],
          '@babel/preset-typescript',
        ],
        exclude: 'node_modules/**',
        include: 'src/**/*.(ts|js)',
        extensions,
        plugins: ['@babel/plugin-transform-runtime'],
      }),
    ],
    external: [/@babel\/runtime/],
  },
];
