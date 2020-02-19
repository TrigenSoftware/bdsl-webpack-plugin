import path from 'path';
import webpack from 'webpack';
import MemoryFs from 'memory-fs';
import HtmlPlugin from 'html-webpack-plugin';
import BdslPlugin from '../src';

export const fs = new MemoryFs();
export const pathToArtifacts = path.resolve(__dirname, 'artifacts');

function createConfig(fixtureEntry, browsers) {
	return {
		name:         browsers,
		mode:         'production',
		devtool:      'inline-source-map',
		optimization: {
			minimize: false
		},
		context:      __dirname,
		entry:        `./${fixtureEntry}`,
		output:       {
			publicPath: '/',
			path:       pathToArtifacts,
			filename:   'bundle.[hash].js'
		},
		module:  {
			rules: [{
				test:    /\.js$/,
				exclude: /node_modules/,
				use:     {
					loader:  'babel-loader',
					options: {
						cacheDirectory: false,
						presets:        [
							['babel-preset-trigen', {
								targets: browsers
							}]
						]
					}
				}
			}]
		},
		plugins:      [
			new HtmlPlugin({
				template: 'index.html',
				inject:   'head'
			}),
			new BdslPlugin({
				browsers
			})
		].filter(Boolean)
	};
}

export default function compile(fixtureEntry, writeToFs = false) {

	const webpackCompiler = webpack([
		createConfig(fixtureEntry, 'last 2 versions and last 1 year'),
		createConfig(fixtureEntry, 'last 2 years and not last 2 versions'),
		createConfig(fixtureEntry, 'defaults')
	]);

	if (!writeToFs) {
		webpackCompiler.outputFileSystem = fs;
	}

	return new Promise((resolve, reject) => {

		webpackCompiler.run((err, stats) => {

			const hasErrors = stats && stats.hasErrors();

			if (err || hasErrors) {
				reject(hasErrors
					? new Error(stats.toJson().errors[0])
					: err
				);
				return;
			}

			resolve(stats.toJson());
		});
	});
}
