import path from 'path';
import webpack from 'webpack';
import MemoryFs from 'memory-fs';
import {
	context
} from './setExampleContext';
import webpackConfig from '../example/webpack.config';

export const fs = new MemoryFs();
export const pathToArtifacts = path.resolve(__dirname, 'artifacts');

function createConfig() {
	return webpackConfig.map((config, i) => ({
		...config,
		context,
		output:       {
			...config.output,
			path:     pathToArtifacts,
			filename: `index.${i}.js`
		},
		optimization: {
			minimize: false
		}
	}));
}

export default function compile(writeToFs = false) {

	const webpackCompiler = webpack(createConfig());

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
