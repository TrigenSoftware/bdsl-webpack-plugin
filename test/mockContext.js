/* eslint-disable import/no-dynamic-require */
import path from 'path';
import {
	addAlias
} from 'module-alias';

let context = '';

export function setExampleContext(example = process.env.EXAMPLE || 'basic') {

	const cwd = process.cwd();

	context = path.join(__dirname, '..', 'examples', example);

	process.chdir(context);

	return process.chdir.bind(process, cwd);
}

export function getContext() {
	return context;
}

export function getWebpackConfig(example) {
	return require(
		example
			? path.join('..', 'examples', example, 'webpack.config.js')
			: path.join(context, 'webpack.config.js')
	);
}

const src = path.join(__dirname, '..', 'src');

if (typeof jest === 'undefined') {
	addAlias('bdsl-webpack-plugin', src);
}
