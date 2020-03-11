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
	renderDsl
} from './render';

/**
 * @typedef {import('./render').HTMLElementObject} HTMLElementObject
 */

/**
 * @typedef {import('./util').JSXElementObject} JSXElementObject
 */

export class BdslBuilder {

	/**
	 * @type {Map<string, RegExp>}
	 */
	useragentRegExpsMap = new Map();
	/**
	 * @type {Map<string, HTMLElementObject[]>}
	 */
	elementsMap = new Map();

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
	}

	/**
	 * Check builder has elements for every environment.
	 * @return {boolean} Result.
	 */
	isFilled() {

		const {
			useragentRegExpsMap,
			elementsMap
		} = this;

		if (!this.isBuildable()) {
			return false;
		}

		if (elementsMap.size !== useragentRegExpsMap.size) {
			return false;
		}

		for (const env of elementsMap.keys()) {

			if (!useragentRegExpsMap.has(env)) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Check builder has enough count of environments.
	 * @return {boolean} Result.
	 */
	isBuildable() {

		const {
			useragentRegExpsMap
		} = this;

		return useragentRegExpsMap.size > 1;
	}

	/**
	 * Add environment scripts.
	 * @param  {object}                                 options - browserslist-useragent-regexp options.
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
			useragentRegExpsMap,
			elementsMap
		} = this;
		const env = getEnvName(options);
		const useragentRegExp = getUserAgentRegExp({
			...commonOptions,
			...options
		});

		useragentRegExpsMap.set(env, useragentRegExp);

		if (elements) {
			elementsMap.set(env, elementsFromJSX(elements));
		}

		return env;
	}

	/**
	 * Set environment scripts.
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

	build({
		unsafeUseDocumentWrite = this.unsafeUseDocumentWrite
	} = {}) {

		if (!this.isBuildable()) {
			throw new Error('Can\'t build: not enough count of environments.');
		}

		const {
			useragentRegExpsMap,
			elementsMap
		} = this;
		const render = unsafeUseDocumentWrite
			? renderDslDw
			: renderDsl;

		return render(useragentRegExpsMap, elementsMap);
	}
}
