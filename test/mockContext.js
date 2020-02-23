/* eslint-disable import/no-dynamic-require */
import path from 'path';
import {
	addAlias
} from 'module-alias';

const {
	EXAMPLE = 'basic'
} = process.env;
const src = path.join(__dirname, '..', 'src');

export const context = path.join(__dirname, '..', 'examples', EXAMPLE);

export function getWebpackConfig(example = EXAMPLE) {
	return require(`../examples/${example}/webpack.config.js`);
}

process.chdir(context);

if (typeof jest === 'undefined') {
	addAlias('bdsl-webpack-plugin', src);
}
