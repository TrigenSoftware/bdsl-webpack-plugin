import {
	getUserAgentRegExp
} from 'browserslist-useragent-regexp';
import {
	getEnvName,
	elementsFromJSX
} from './util';
import {
	renderDsl as renderDslDw
} from './render-dw';
import {
	renderModuleTest,
	renderUserAgentRegExpTest,
	renderDsl
} from './render';

/**
 * @typedef {import('./render').HTMLElementObject} HTMLElementObject
 */

/**
 * @typedef {import('./util').JSXElementObject} JSXElementObject
 */

/**
 * Browserslist Differential Script Loading builder.
 */
export class BdslBuilder {

	/**
	 * Browserslist Differential Script Loading builder.
	 * @param {object}  [options] - Builder and browserslist-useragent-regexp common options.
	 * @param {boolean} [options.ignorePatch=true] - Ignore differences in patch browser numbers.
	 * @param {boolean} [options.ignoreMinor=false] - Ignore differences in minor browser versions.
	 * @param {boolean} [options.allowHigherVersions=true] - Return a match if the useragent version is equal to
	 *                                                       or higher than the one specified in browserslist.
	 * @param {boolean} [options.allowZeroSubverions=true] - Ignore match of patch or patch and minor, if they are 0.
	 * @param {boolean} [options.unsafeUseDocumentWrite=false] - Use `document.write()` to inject `<script>`.
	 *                                                           This variant supports `defer` scripts,
	 *                                                           but some browsers can restrict `document.write()` calls.
	 */
	constructor({
		ignorePatch = true,
		ignoreMinor = false,
		allowHigherVersions = true,
		allowZeroSubverions = true,
		unsafeUseDocumentWrite = false
	} = {}) {

		this.commonOptions = {
			ignorePatch,
			ignoreMinor,
			allowHigherVersions,
			allowZeroSubverions
		};
		this.unsafeUseDocumentWrite = unsafeUseDocumentWrite;

		/**
		 * @type {Map<string, string>}
		 */
		this.testersMap = new Map();

		/**
		 * @type {Map<string, HTMLElementObject[]>}
		 */
		this.elementsMap = new Map();
	}

	/**
	 * Check builder has enough count of environments.
	 * @return {boolean} Result.
	 */
	isBuildable() {

		const {
			testersMap
		} = this;

		return testersMap.size > 1;
	}

	/**
	 * Check builder has elements for every environment.
	 * @return {boolean} Result.
	 */
	isFilled() {

		const {
			testersMap,
			elementsMap
		} = this;

		if (!this.isBuildable()) {
			return false;
		}

		if (elementsMap.size !== testersMap.size) {
			return false;
		}

		for (const env of elementsMap.keys()) {

			if (!testersMap.has(env)) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Get HTML elements for default env.
	 * @return {HTMLElementObject[]} Elements.
	 */
	getDefaultEnvElements() {

		const {
			testersMap,
			elementsMap
		} = this;
		const defaultEnv = Array.from(testersMap.keys()).pop();
		const defaultEnvElements = elementsMap.get(defaultEnv);

		return defaultEnvElements;
	}

	/**
	 * Add environment.
	 * @param  {object}                                 options - browserslist-useragent-regexp options.
	 * @param  {boolean}                                [options.isModule] - Use `type=module` support check instead of RegExp.
	 * @param  {string | string[]}                      [options.browsers] - Manually provide a browserslist query (or an array of queries).
	 * @param  {string}                                 [options.env] - Pick the config belonging to this environment.
	 * @param  {boolean}                                [options.ignorePatch=true] - Ignore differences in patch browser numbers.
	 * @param  {boolean}                                [options.ignoreMinor=false] - Ignore differences in minor browser versions.
	 * @param  {boolean}                                [options.allowHigherVersions=true] - Return a match if the useragent version
	 *                                                                                       is equal to or higher than the one specified
	 *                                                                                       in browserslist.
	 * @param  {boolean}                                [options.allowZeroSubverions=true] - Ignore match of patch or patch and minor,
	 *                                                                                       if they are 0.
	 * @param  {(HTMLElementObject|JSXElementObject)[]} [elements] - script/style elements.
	 * @return {string} Added environment name.
	 */
	addEnv(options, elements) {

		const {
			commonOptions,
			testersMap
		} = this;
		const {
			isModule
		} = options;
		const env = getEnvName(options);

		if (isModule) {
			testersMap.set(env, renderModuleTest());
		} else {

			const useragentRegExp = getUserAgentRegExp({
				...commonOptions,
				...options
			});

			testersMap.set(env, renderUserAgentRegExpTest(useragentRegExp));
		}

		if (elements) {
			this.setEnvElements(env, elements);
		}

		return env;
	}

	/**
	 * Set environment elements.
	 * @param  {string|object}                          optionsOrEnv - Env name or browserslist-useragent-regexp options.
	 * @param  {(HTMLElementObject|JSXElementObject)[]} elements - script/style elements.
	 * @return {string} Environment name.
	 */
	setEnvElements(optionsOrEnv, elements) {

		const {
			elementsMap
		} = this;
		const env = getEnvName(optionsOrEnv);

		elementsMap.set(env, elementsFromJSX(elements));

		return env;
	}

	/**
	 * Build DSL script.
	 * @param  {object}  [options] - Build options.
	 * @param  {boolean} [options.unsafeUseDocumentWrite=false] - Use `document.write()` to inject `<script>`.
	 *                                                            This variant supports `defer` scripts,
	 *                                                            but some browsers can restrict `document.write()` calls.
	 * @param  {boolean} [options.debug] - Print debug info.
	 * @return {string} DSL script.
	 */
	build({
		unsafeUseDocumentWrite = this.unsafeUseDocumentWrite,
		debug = process.env.NODE_ENV !== 'production'
	} = {}) {

		if (!this.isBuildable()) {
			throw new Error('Can\'t build: not enough count of environments.');
		}

		const {
			testersMap,
			elementsMap
		} = this;
		const render = unsafeUseDocumentWrite
			? renderDslDw
			: renderDsl;
		const dsl = render(testersMap, elementsMap, debug);

		return dsl;
	}
}
