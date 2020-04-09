import {
	getUserAgentRegExp
} from 'browserslist-useragent-regexp';
import {
	getEnvName,
	elementsFromJSX
} from '../util';
import {
	SSRAssetsContainer
} from './SSRAssetsContainer';

/**
 * @typedef {import('../render').HTMLElementObject} HTMLElementObject
 */

/**
 * SSR Assets Collector.
 */
export class SSRAssetsCollector {

	/**
	 * SSR Assets Collector.
	 * @param {object}  [options] - browserslist-useragent-regexp common options.
	 * @param {boolean} [options.ignorePatch=true] - Ignore differences in patch browser numbers.
	 * @param {boolean} [options.ignoreMinor=false] - Ignore differences in minor browser versions.
	 * @param {boolean} [options.allowHigherVersions=true] - Return a match if the useragent version is equal to
	 *                                                       or higher than the one specified in browserslist.
	 * @param {boolean} [options.allowZeroSubverions=true] - Ignore match of patch or patch and minor, if they are 0.
	 */
	constructor({
		ignorePatch = true,
		ignoreMinor = false,
		allowHigherVersions = true,
		allowZeroSubverions = true
	} = {}) {

		this.commonOptions = {
			ignorePatch,
			ignoreMinor,
			allowHigherVersions,
			allowZeroSubverions
		};

		/**
		 * @type {Map<string, RegExp>}
		 */
		this.envsMap = new Map();

		/**
		 * @type {Map<string, SSRAssetsContainer>}
		 */
		this.containersMap = new Map();
	}

	/**
	 * Check collector has enough count of environments.
	 * @return {boolean} Result.
	 */
	isCollected() {

		const {
			envsMap
		} = this;

		return envsMap.size > 1;
	}

	/**
	 * Check collector has containers for every environment.
	 * @return {boolean} Result.
	 */
	isFilled() {

		const {
			envsMap,
			containersMap
		} = this;

		if (!this.isCollected()) {
			return false;
		}

		if (containersMap.size !== envsMap.size) {
			return false;
		}

		for (const env of containersMap.keys()) {

			if (!envsMap.has(env)) {
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
			envsMap,
			containersMap
		} = this;
		const defaultEnv = Array.from(envsMap.keys()).pop();
		const defaultEnvElements = containersMap.get(defaultEnv).getObjects();

		return defaultEnvElements;
	}

	/**
	 * Add environment.
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
	 * @param  {(HTMLElementObject|JSXElementObject)[]} [objects] - HTML element object.
	 * @param  {string[]}                               [tags] - HTML element string.
	 * @return {string} Added environment name.
	 */
	addEnv(options, objects, tags) {

		const {
			commonOptions,
			envsMap
		} = this;
		const env = getEnvName(options);
		const useragentRegExp = getUserAgentRegExp({
			...commonOptions,
			...options
		});

		envsMap.set(env, useragentRegExp);

		if (objects && tags) {
			this.setEnvAssets(env, objects, tags);
		}

		return env;
	}

	/**
	 * Add asset to env.
	 * @param  {string|object}                          optionsOrEnv - Env name or browserslist-useragent-regexp options.
	 * @param  {(HTMLElementObject|JSXElementObject)[]} objects - HTML element object.
	 * @param  {string[]}                               tags - HTML element string.
	 * @return {SSRAssetsCollector} This collector.
	 */
	setEnvAssets(optionsOrEnv, objects, tags) {

		const {
			containersMap
		} = this;
		const env = getEnvName(optionsOrEnv);

		if (!containersMap.has(env)) {
			containersMap.set(env, new SSRAssetsContainer(env));
		}

		const container = containersMap.get(env);

		container.set(elementsFromJSX(objects), tags);

		return this;
	}

	/**
	 * Get JS object from collector.
	 * @return {object} JS object.
	 */
	toJS() {

		if (!this.isCollected()) {
			throw new Error('Can\'t get JS object: not enough count of environments.');
		}

		const {
			envsMap,
			containersMap
		} = this;
		const matchers = Array.from(envsMap.entries()).reduce((matchers, [env, regExp]) => ({
			...matchers,
			[env]: regExp.toString().replace(/^\/|\/$/, '')
		}), {});
		const assets = Array.from(containersMap.entries()).reduce((assets, [env, container]) => ({
			...assets,
			[env]: container.toJS()
		}), {});

		return {
			matchers,
			assets
		};
	}

	/**
	 * Get JSON string from collector.
	 * @return {string} JSON string.
	 */
	toJson() {
		return JSON.stringify(this.toJS(), null, '  ');
	}
}
