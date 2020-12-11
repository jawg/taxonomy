import riot from 'rollup-plugin-riot';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import css from 'rollup-plugin-css-porter';
import { babel } from '@rollup/plugin-babel';
import serve from 'rollup-plugin-serve'
import html from '@rollup/plugin-html';
import fs from 'fs';

export default [
  {
    input: 'src/index.js',
    output: {
      file: '.serve/taxonomy-bundle+riot.js',
      format: 'iife',
    },
    plugins: [
      riot(),
      nodeResolve(),
      commonjs(),
      babel({ babelHelpers: 'bundled', presets: ['@babel/env'] }),
      css({ raw: false, minified: '.serve/style.css' }),
      serve({ host: 'localhost', port: 8000, contentBase: '.serve' }),
      html({ template: () => fs.readFileSync('./demo/index.html').toString().replace(/..\/dist\//g, './') }),
    ],
  },
];
