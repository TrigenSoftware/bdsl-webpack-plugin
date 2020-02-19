import {
	DefinePlugin
} from 'webpack';
import HtmlPlugin from 'html-webpack-plugin';
import {
	getUserAgentRegExp
} from 'browserslist-useragent-regexp';
import {
	renderDsl
} from './render';

export * from './browserslist';

export const indentifier = 'BdslWebpackPlugin';

const useragentRegExpsMap = new Map();
const scriptsElementsMap = new Map();

export default class BdslWebpackPlugin {

	/**
	 * Browserslist Differential Script Loading webpack plugin.
	 * @param {object}            [options] - browserslist-useragent-regexp options.
	 * @param {string | string[]} [options.browsers] - Manually provide a browserslist query (or an array of queries).
	 * @param {string?}           [options.env] - Pick the config belonging to this environment.
	 * @param {boolean?}          [options.ignorePatch=true] - Ignore differences in patch browser numbers.
	 * @param {boolean?}          [options.ignoreMinor=false] - Ignore differences in minor browser versions.
	 * @param {boolean?}          [options.allowHigherVersions=true] - Return a match if the useragent version is equal to
	 *                                                                 or higher than the one specified in browserslist.
	 * @param {boolean?}          [options.allowZeroSubverions=true] - Ignore match of patch or patch and minor, if they are 0.
	 */
	constructor(options = {}) {

		const env = typeof options.browsers !== 'undefined'
			? String(options.browsers)
			: typeof options.env !== 'undefined'
				? options.env
				: undefined;
		const useragentRegExp = getUserAgentRegExp({
			allowHigherVersions: true,
			allowZeroSubverions: true,
			...options
		});

		useragentRegExpsMap.set(env, useragentRegExp);

		this.env = env;
		this.definePlugin = new DefinePlugin({
			'process.env.BDSL_ENV': JSON.stringify(env)
		});
		this.injectDsl = this.injectDsl.bind(this);
	}

	apply(compiler) {

		// eslint-disable-next-line prefer-reflect
		this.definePlugin.apply(compiler);

		compiler.hooks.compilation.tap(indentifier, (compilation) => {

			if (HtmlPlugin.getHooks) {
				HtmlPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
					indentifier,
					this.injectDsl
				);
			} else {
				compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
					indentifier,
					this.injectDsl
				);
			}
		});
	}

	injectDsl({
		headTags,
		head = headTags
	}, done) {

		const {
			env
		} = this;
		const currentScripts = head.filter(
			element => element.tagName === 'script' && element.attributes
		);

		scriptsElementsMap.set(env, currentScripts);

		if (scriptsElementsMap.size !== useragentRegExpsMap.size) {
			done();
			return;
		}

		const dsl = renderDsl(useragentRegExpsMap, scriptsElementsMap);
		const dslScript = {
			tagName:   'script',
			innerHTML: dsl,
			voidTag:   false
		};

		currentScripts.forEach((script, i) => {

			const indexToRemove = head.indexOf(script);

			if (i) {
				head.splice(indexToRemove, 1);
			} else {
				head.splice(indexToRemove, 1, dslScript);
			}
		});

		done();
	}
}
