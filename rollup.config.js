import riot from 'rollup-plugin-riot';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-porter';
import { emptyDirectories } from 'rollup-plugin-app-utils';
import { babel } from '@rollup/plugin-babel';

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/taxonomy-bundle+riot.js',
      format: 'iife',
    },
    plugins: [
      emptyDirectories('dist'),
      riot(),
      nodeResolve(),
      commonjs(),
      babel({ babelHelpers: 'bundled', presets: ['@babel/env'] }),
      terser(),
      css({ raw: false, minified: 'dist/style.css' }),
    ],
  },
];
