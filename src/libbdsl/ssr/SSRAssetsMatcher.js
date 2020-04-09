/* eslint-disable no-sync */
import realFs from 'fs';
import {
	SSRAssetsContainer
} from './SSRAssetsContainer';

/**
 * SSR Assets Matcher.
 */
export class SSRAssetsMatcher {

	/**
	 * SSR Assets Matcher.
	 * @param {object} options - Options to create matcher.
	 * @param {object} [assets] - Assets collection object.
	 * @param {string} [options.assetsFile] - Path to JSON file with assets info.
	 * @param {object} [options.fs] - NodeJS's FS compatible module.
	 */
	constructor({
		assets,
		assetsFile,
		fs = realFs
	}) {

		/**
		 * @type {Map<string, RegExp>}
		 */
		this.envsMap = new Map();

		/**
		 * @type {string}
		 */
		this.defaultEnv = null;

		/**
		 * @type {Map<string, SSRAssetsContainer>}
		 */
		this.containersMap = new Map();

		if (assets) {
			this.parseAssetsCollection(assets);
		} else {
			this.readAssetsCollection(fs, assetsFile);
		}
	}

	parseAssetsCollection({
		matchers,
		assets
	}) {

		const {
			envsMap,
			containersMap
		} = this;

		this.defaultEnv = Object.keys(matchers).pop();

		Object.entries(matchers).forEach(([env, regExp]) => {
			envsMap.set(env, new RegExp(regExp));
		});

		Object.entries(assets).forEach(([env, container]) => {
			containersMap.set(env, SSRAssetsContainer.fromJS(env, container));
		});
	}

	readAssetsCollection(fs, assetsFile) {

		const file = fs.readFileSync(assetsFile, 'utf8');
		const collection = JSON.parse(file);

		this.parseAssetsCollection(collection);
	}

	/**
	 * Get assets for browser by useragent.
	 * @param  {string} userAgent - UserAgent to match assets.
	 * @return {SSRAssetsContainer} Assets container.
	 */
	match(userAgent) {

		const {
			envsMap,
			defaultEnv,
			containersMap
		} = this;
		const matchers = envsMap.entries();

		for (const [env, regExp] of matchers) {

			if (regExp.test(userAgent)) {
				return containersMap.get(env);
			}
		}

		return containersMap.get(defaultEnv);
	}
}
