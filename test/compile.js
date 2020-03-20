import path from 'path';
import webpack from 'webpack';
import MemoryFs from 'memory-fs';
import {
	getContext,
	getWebpackConfig
} from './mockContext';

export const fs = new MemoryFs();
export const pathToArtifacts = path.resolve(__dirname, 'artifacts');

const filenames = {
	2: [
		'esm',
		'old'
	],
	3: [
		'modern',
		'actual',
		'old'
	]
};

function createTestConfig() {
	return getWebpackConfig().map((config, i, configs) => ({
		...config,
		context:      getContext(),
		output:       {
			...config.output,
			path:     pathToArtifacts,
			filename: `index.${filenames[configs.length][i]}.js`
		},
		optimization: {
			minimize: false
		}
	}));
}

export default function compile(writeToFs = false) {

	const webpackCompiler = webpack(createTestConfig());

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
