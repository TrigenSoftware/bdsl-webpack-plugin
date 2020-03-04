const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
	BdslWebpackPlugin,
	getBrowserslistQueries,
	getBrowserslistEnvList
} = require('bdsl-webpack-plugin');

/**
 * Create webpack config for given browsers.
 * @param  {string} [env] - Browserslist environment.
 * @return {object} Webpack config.
 */
function createWebpackConfig(env) {

	const isEsm = env === 'esm';

	return {
		name:    env,
		mode:    'production',
		entry:   './src/script.js',
		output:  {
			publicPath: '/',
			path:       path.resolve(__dirname, 'build'),
			filename:   'index.[hash].js'
		},
		module:  {
			rules: [{
				test:    /\.js$/,
				exclude: /node_modules/,
				loader:  'babel-loader',
				options: {
					cacheDirectory: true,
					presets:        isEsm ? [
						'@babel/preset-modules'
					] : [
						['@babel/preset-env', {
							modules:     false,
							useBuiltIns: 'usage',
							corejs:      3,
							targets:     getBrowserslistQueries({ env })
						}]
					],
					plugins:        isEsm ? [] : [
						'@babel/plugin-proposal-class-properties',
						'@babel/plugin-proposal-async-generator-functions',
						'@babel/plugin-transform-runtime'
					]
				}
			}]
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: 'src/index.html',
				inject:   'head'
			}),
			new BdslWebpackPlugin({ env })
		]
	};
}

module.exports = [
	...getBrowserslistEnvList(),
	undefined // to use default .browserslistrc queries
].map(createWebpackConfig);
