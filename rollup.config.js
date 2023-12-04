import riot from 'rollup-plugin-riot';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { emptyDirectories } from 'rollup-plugin-app-utils';
import { babel } from '@rollup/plugin-babel';
import serve from 'rollup-plugin-serve';
import html from '@rollup/plugin-html';
import json from '@rollup/plugin-json';
import fs from 'fs';

const useServe = process.env.ROLLUP_SERVE === 'true';
const output = useServe ? '.serve' : 'dist';
const plugins = [
  !useServe && emptyDirectories(output),
  riot(),
  json(),
  nodeResolve(),
  commonjs(),
  babel({ babelHelpers: 'bundled', presets: ['@babel/env'] }),
  !useServe && terser(),
  useServe && serve({ host: 'localhost', port: 8000, contentBase: ['.serve', './'] }),
  useServe && html({
    template: () =>
      fs
        .readFileSync('./demo/index.html')
        .toString()
        .replace(/..\/dist\//g, './')
        .replace('https://jawg.github.io/taxonomy/example.json', './example.json'),
  }),
].filter(plugin => plugin)


export default [
  {
    input: 'src/index.js',
    output: {
      file: `${output}/taxonomy-bundle+riot.js`,
      format: 'iife',
      sourcemap: useServe,
    },
    plugins,
  },
];
