import {
	external
} from '@trigen/scripts-plugin-rollup/helpers';
import { eslint } from 'rollup-plugin-eslint';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import pkg from './package.json';

const plugins = [
	eslint({
		exclude:      ['**/*.json', 'node_modules/**'],
		throwOnError: true
	}),
	commonjs(),
	babel({
		babelHelpers:       'runtime',
		skipPreflightCheck: true
	})
];

export default {
	input:    'src/index.js',
	plugins,
	external: external(pkg, true),
	output:   {
		file:      pkg.main,
		format:    'cjs',
		exports:   'named',
		sourcemap: 'inline'
	}
};
