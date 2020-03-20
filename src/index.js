import {
	DefinePlugin
} from 'webpack';
import HtmlPlugin from 'html-webpack-plugin';
import {
	BdslBuilder
} from './libbdsl';

export * from './libbdsl';

export const indentifier = 'BdslWebpackPlugin';

const builders = new Map();

/**
 * Browserslist Differential Script Loading webpack plugin.
 */
export default class BdslWebpackPlugin {

	/**
	 * Browserslist Differential Script Loading webpack plugin.
	 * @param {object}            [options] - Plugin options.
	 * @param {string}            [options.groupId='default'] - Plugins group id.
	 * @param {boolean}           [options.isModule] - Use `type=module` support check instead of RegExp.
	 *                                                 Should be used only on certain build.
	 * @param {string | string[]} [options.browsers] - Manually provide a browserslist query (or an array of queries).
	 * @param {string}            [options.env] - Pick the config belonging to this environment.
	 * @param {boolean}           [options.ignorePatch=true] - Ignore differences in patch browser numbers.
	 * @param {boolean}           [options.ignoreMinor=false] - Ignore differences in minor browser versions.
	 * @param {boolean}           [options.allowHigherVersions=true] - Return a match if the useragent version is equal to
	 *                                                                 or higher than the one specified in browserslist.
	 * @param {boolean}           [options.allowZeroSubverions=true] - Ignore match of patch or patch and minor, if they are 0.
	 * @param {boolean}           [options.withStylesheets=false] - Enable differential stylesheets loading.
	 * @param {boolean}           [options.unsafeUseDocumentWrite=false] - Use `document.write()` to inject `<script>`.
	 *                                                                     This variant supports `defer` scripts,
	 *                                                                     but some browsers can restrict `document.write()` calls.
	 */
	constructor(options = {}) {

		this.options = options;
		this.ingoreHtmlFilename = null;
		this.filterAssets = this.filterAssets.bind(this);
		this.injectDsl = this.injectDsl.bind(this);

		const builder = this.getBuilder();
		const env = builder.addEnv(options);

		this.env = env;
		this.builder = builder;
		this.definePlugin = new DefinePlugin({
			'process.env.BDSL_ENV': JSON.stringify(env)
		});
	}

	getBuilder() {

		const {
			groupId = 'default'
		} = this.options;

		if (builders.has(groupId)) {
			return builders.get(groupId);
		}

		const builder = new BdslBuilder();

		builders.set(groupId, builder);

		return builder;
	}

	releaseBuilder() {

		const {
			groupId = 'default'
		} = this.options;

		builders.delete(groupId);
	}

	apply(compiler) {

		const {
			builder
		} = this;

		if (!builder.isBuildable()) {
			return;
		}

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

		compiler.hooks.emit.tap(
			indentifier,
			this.filterAssets
		);
	}

	injectDsl({
		plugin,
		outputName,
		headTags,
		head = headTags
	}, done) {

		const {
			options,
			env,
			builder
		} = this;
		const {
			withStylesheets
		} = options;
		const currentElements = head.filter(
			element => element.attributes && (
				element.tagName === 'script'
				|| (
					withStylesheets
					&& element.tagName === 'link'
					&& element.attributes.rel === 'stylesheet'
				)
			)
		);

		this.ingoreHtmlFilename = outputName;

		builder.setEnvElements(env, currentElements);

		if (!builder.isFilled()) {
			done();
			return;
		}

		const dsl = builder.build(options);
		const dslScript = {
			tagName:   'script',
			innerHTML: dsl,
			voidTag:   false
		};

		currentElements.forEach((element, i) => {

			const indexToRemove = head.indexOf(element);

			if (i) {
				head.splice(indexToRemove, 1);
			} else {

				const noscript = this.createNoscriptFallback(plugin);

				if (noscript) {
					head.splice(indexToRemove, 1, dslScript, noscript);
				} else {
					head.splice(indexToRemove, 1, dslScript);
				}
			}
		});

		this.releaseBuilder();
		done();
	}

	createNoscriptFallback(plugin) {

		const {
			builder
		} = this;
		const defaultElements = builder.getDefaultEnvElements();
		const innerHTML = defaultElements.reduce((innerHTML, element) => {

			if (element.tagName === 'link') {
				return `${innerHTML}${plugin.createHtmlTag(element)}`;
			}

			return innerHTML;
		}, '');

		if (!innerHTML.length) {
			return null;
		}

		return {
			tagName:    'noscript',
			closeTag:   true,
			attributes: {},
			innerHTML
		};
	}

	filterAssets(compilation) {

		const {
			builder
		} = this;

		if (builder.isFilled()) {
			return;
		}

		const {
			ingoreHtmlFilename
		} = this;

		compilation.assets = Object.entries(compilation.assets).reduce(
			(assets, [name, asset]) => {

				if (name !== ingoreHtmlFilename) {
					assets[name] = asset;
				}

				return assets;
			},
			{}
		);
	}
}

export {
	BdslWebpackPlugin
};
