import BdslWebpackPluginBase from './BdslWebpackPluginBase';
import {
	BdslBuilder
} from './libbdsl';

const builders = new Map();

/**
 * Browserslist Differential Script Loading webpack plugin.
 */
export default class BdslWebpackPlugin extends BdslWebpackPluginBase {

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

		super(options);

		const builder = this.getBuilder();

		builder.addEnv(options);

		this.builder = builder;
		this.injectDsl = this.injectDsl.bind(this);
	}

	getBuilder() {
		return this.getProcessorInstance(builders, BdslBuilder);
	}

	releaseBuilder() {
		return this.releaseProcessorInstance(builders);
	}

	apply(compiler) {

		const {
			identifier
		} = BdslWebpackPlugin;
		const {
			builder
		} = this;

		if (!builder.isBuildable()) {
			return;
		}

		this.tapAssetsHook(compiler, identifier, this.injectDsl);
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
		const currentElements = this.getCurrentElements(head);

		this.setHtmlFilename(outputName);

		builder.setEnvElements(env, currentElements);

		if (!builder.isFilled()) {
			done();
			return;
		}

		const dsl = builder.build(options);
		const dslScript = {
			tagName:   'script',
			innerHTML: dsl,
			voidTag:   false,
			closeTag:  true
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

	filterAssets(compilation) {

		const {
			builder
		} = this;

		if (builder.isFilled()) {
			return;
		}

		super.filterAssets(compilation);
	}

	createNoscriptFallback(plugin) {

		const {
			builder
		} = this;
		const defaultElements = builder.getDefaultEnvElements();
		const noscript = super.createNoscriptFallback(plugin, defaultElements);

		return noscript;
	}
}

BdslWebpackPlugin.identifier = 'BdslWebpackPlugin';
