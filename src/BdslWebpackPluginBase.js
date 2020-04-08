import {
	DefinePlugin
} from 'webpack';
import HtmlPlugin from 'html-webpack-plugin';
import {
	getEnvName
} from './libbdsl';

export default class BdslWebpackPluginBase {

	constructor(options = {}) {

		this.options = options;
		this.ingoreHtmlFilename = null;
		this.filterAssets = this.filterAssets.bind(this);

		const env = getEnvName(options);

		this.env = env;
		this.definePlugin = new DefinePlugin({
			'process.env.BDSL_ENV': JSON.stringify(env)
		});
	}

	getProcessorInstance(store, Processor) {

		const {
			groupId = 'default'
		} = this.options;

		if (store.has(groupId)) {
			return store.get(groupId);
		}

		const processor = new Processor();

		store.set(groupId, processor);

		return processor;
	}

	releaseProcessorInstance(store) {

		const {
			groupId = 'default'
		} = this.options;

		store.delete(groupId);
	}

	tapAssetsHook(compiler, identifier, handler) {

		// eslint-disable-next-line prefer-reflect
		this.definePlugin.apply(compiler);

		compiler.hooks.compilation.tap(identifier, (compilation) => {

			if (HtmlPlugin.getHooks) {
				HtmlPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
					identifier,
					handler
				);
			} else {
				compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
					identifier,
					handler
				);
			}
		});

		compiler.hooks.emit.tap(
			identifier,
			this.filterAssets
		);
	}

	filterAssets(compilation) {

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

	getCurrentElements(head) {

		const {
			withStylesheets
		} = this.options;
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

		return currentElements;
	}

	setHtmlFilename(filename) {
		this.ingoreHtmlFilename = filename;
	}

	createNoscriptFallback(plugin, elements) {

		const innerHTML = elements.reduce((innerHTML, element) => {

			if (element.tagName === 'link') {
				return `${innerHTML}${this.createHtmlTag(plugin, element)}`;
			}

			return innerHTML;
		}, '');

		if (!innerHTML.length) {
			return null;
		}

		return {
			tagName:    'noscript',
			attributes: {},
			voidTag:    false,
			closeTag:   true,
			innerHTML
		};
	}

	createHtmlTag(plugin, element) {

		if (typeof plugin.prepareAssetTagGroupForRendering === 'function') {
			return plugin.prepareAssetTagGroupForRendering([element]);
		}

		return plugin.createHtmlTag(element);
	}
}
