const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const postcssPresetEnv = require('postcss-preset-env');
const {
	BdslWebpackPlugin,
	getBrowserslistQueries,
	getBrowserslistEnvList
} = require('bdsl-webpack-plugin');

const browserslistEnvList = getBrowserslistEnvList();

/**
 * Create webpack config for given browsers.
 * @param  {string | string[]} [browsersOrEnv] - Browserslist queries or environment.
 * @return {object} Webpack config.
 */
function createWebpackConfig(browsersOrEnv) {

	let [
		browsers,
		env
	] = browserslistEnvList.includes(browsersOrEnv)
		? [undefined, browsersOrEnv]
		: [browsersOrEnv];

	if (!browsers) {
		browsers = getBrowserslistQueries({ env });
	}

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
				loader:  'babel-loader',
				options: {
					cacheDirectory: true,
					presets:        [
						['@babel/preset-env', {
							modules:     false,
							useBuiltIns: 'usage',
							corejs:      3,
							targets:     browsers
						}]
					],
					plugins:        [
						'@babel/plugin-proposal-class-properties',
						'@babel/plugin-proposal-async-generator-functions',
						'@babel/plugin-transform-runtime'
					]
				}
			}, {
				test: /\.css$/,
				use:  [
					MiniCssExtractPlugin.loader,
					{
						loader:  'css-loader',
						options: { importLoaders: 1 }
					}, {
						loader:  'postcss-loader',
						options: {
							ident:   'postcss',
							plugins: () => [
								postcssPresetEnv({
									preserve: false,
									stage:    0,
									browsers
								})
							]
						}
					}
				]
			}]
		},
		plugins: [
			new MiniCssExtractPlugin({
				filename: '[name].[hash].css'
			}),
			new HtmlWebpackPlugin({
				template: 'src/index.html',
				inject:   'head'
			}),
			new ScriptExtHtmlWebpackPlugin({
				defaultAttribute: 'defer'
			}),
			new BdslWebpackPlugin({
				withStylesheets:        true,
				unsafeUseDocumentWrite: true, // to load styles synchronously
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
	undefined // to use default .browserslistrc queries
].map(createWebpackConfig);

*/
