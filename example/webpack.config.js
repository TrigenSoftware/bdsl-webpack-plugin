const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
	BdslWebpackPlugin,
	getBrowserslistQueries,
	getBrowserslistEnvList
} = require(/* 'bdsl-webpack-plugin' */ '../src');

const browserslistEnvList = getBrowserslistEnvList();

/**
 * Create webpack config for given browsers.
 * @param  {string | string[]} [browsersOrEnv] - Browserslist queries or environment.
 * @return {object} Webpack config.
 */
function createWebpackConfig(browsersOrEnv) {

	const [
		browsers,
		env
	] = browserslistEnvList.includes(browsersOrEnv)
		? [undefined, browsersOrEnv]
		: [browsersOrEnv];

	return {
		name:    browsersOrEnv,
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
				use:     {
					loader:  'babel-loader',
					options: {
						cacheDirectory: true,
						presets:        [
							['@babel/preset-env', {
								modules:     false,
								useBuiltIns: 'usage',
								corejs:      3,
								targets:     browsers || getBrowserslistQueries({ env })
							}]
						],
						plugins:        [
							'@babel/plugin-proposal-class-properties',
							'@babel/plugin-proposal-async-generator-functions',
							'@babel/plugin-transform-runtime'
						]
					}
				}
			}]
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: 'src/index.html',
				inject:   'head'
			}),
			new BdslWebpackPlugin({
				browsers,
				env
			})
		]
	};
}

module.exports = [
	createWebpackConfig('modern'),
	createWebpackConfig('last 2 years and not last 2 versions'),
	createWebpackConfig()
];

/*

...or just:

module.exports = [
	...browserslistEnvList,
	undefined
].map(createWebpackConfig);

*/
