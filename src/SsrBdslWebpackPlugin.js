import BdslWebpackPluginBase from './BdslWebpackPluginBase';
import {
	SSRAssetsCollector
} from './libbdsl';

const collectors = new Map();

/**
 * Browserslist Differential Script Loading webpack plugin for SSR.
 */
export default class SsrBdslWebpackPlugin extends BdslWebpackPluginBase {

	/**
	 * Browserslist Differential Script Loading webpack plugin for SSR.
	 * @param {object}            [options] - Plugin options.
	 * @param {string}            [options.filename='ssr-bdsl-assets.json'] - Assets collection JSON file name.
	 * @param {string}            [options.groupId='default'] - Plugins group id.
	 * @param {string | string[]} [options.browsers] - Manually provide a browserslist query (or an array of queries).
	 * @param {string}            [options.env] - Pick the config belonging to this environment.
	 * @param {boolean}           [options.ignorePatch=true] - Ignore differences in patch browser numbers.
	 * @param {boolean}           [options.ignoreMinor=false] - Ignore differences in minor browser versions.
	 * @param {boolean}           [options.allowHigherVersions=true] - Return a match if the useragent version is equal to
	 *                                                                 or higher than the one specified in browserslist.
	 * @param {boolean}           [options.allowZeroSubverions=true] - Ignore match of patch or patch and minor, if they are 0.
	 * @param {boolean}           [options.withStylesheets=false] - Enable differential stylesheets loading.
	 * @param {boolean}           [options.replaceTagsWithPlaceholder=false] - Replace script/link tags in HTML-file to
	 *                                                                   `<ssr-placeholder></ssr-placeholder>`.
	 */
	constructor(options = {}) {

		super(options);

		const collector = this.getCollector();

		collector.addEnv(options);

		this.assetsCollected = new Promise((resolve) => {
			this.resolveAssetsCollected = resolve;
		});
		this.collector = collector;
		this.collectAssets = this.collectAssets.bind(this);
		this.emitAssetsCollection = this.emitAssetsCollection.bind(this);
	}

	getCollector() {
		return this.getProcessorInstance(collectors, SSRAssetsCollector);
	}

	releaseCollector() {
		return this.releaseProcessorInstance(collectors);
	}

	apply(compiler) {

		const {
			identifier
		} = SsrBdslWebpackPlugin;
		const {
			collector
		} = this;

		if (!collector.isCollected()) {
			return;
		}

		this.tapAssetsHook(compiler, identifier, this.collectAssets);
		compiler.hooks.emit.tapPromise(identifier, this.emitAssetsCollection);
	}

	collectAssets({
		plugin,
		outputName,
		headTags,
		head = headTags
	}) {

		const {
			options,
			env,
			collector
		} = this;
		const {
			replaceTagsWithPlaceholder
		} = options;
		const currentElements = this.getCurrentElements(head);
		const currentElementsTags = currentElements.map(
			element => this.createHtmlTag(plugin, element)
		);

		this.setHtmlFilename(outputName);
		collector.setEnvAssets(env, currentElements, currentElementsTags);

		if (!collector.isFilled()) {
			this.resolveAssetsCollected(null);
			return;
		}

		if (replaceTagsWithPlaceholder) {

			const placeholder = {
				tagName:   'ssr-placeholder',
				voidTag:   true,
				closeTag:  false
			};

			currentElements.forEach((element, i) => {

				const indexToRemove = head.indexOf(element);

				if (i) {
					head.splice(indexToRemove, 1);
				} else {
					head.splice(indexToRemove, 1, placeholder);
				}
			});
		}

		const assetsCollection = collector.toJson();

		this.resolveAssetsCollected(assetsCollection);
		this.releaseCollector();
	}

	async emitAssetsCollection(compiler) {

		const {
			filename = 'ssr-bdsl-assets.json'
		} = this.options;
		const assetsCollection = await this.assetsCollected;

		if (assetsCollection) {
			compiler.assets[filename] = {
				source() {
					return assetsCollection;
				},
				size() {
					return assetsCollection.length;
				}
			};
		}
	}

	filterAssets(compilation) {

		const {
			collector
		} = this;

		if (collector.isFilled()) {
			return;
		}

		super.filterAssets(compilation);
	}
}

SsrBdslWebpackPlugin.identifier = 'SsrBdslWebpackPlugin';
