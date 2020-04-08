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
	 * @param {string} options.assetsFile - Path to JSON file with assets info.
	 * @param {object} [options.fs] - NodeJS's FS compatible module.
	 */
	constructor({
		assetsFile,
		fs = realFs
	}) {

		/**
		 * @type {Map<string, RegExp>}
		 */
		this.envs = new Map();

		/**
		 * @type {Map<string, SSRAssetsContainer>}
		 */
		this.containers = new Map();

		this.readAssetsCollection(fs, assetsFile);
	}

	readAssetsCollection(fs, assetsFile) {

		const {
			envs,
			containers
		} = this;
		const file = fs.readFileSync(assetsFile, 'utf8');
		const collection = JSON.parse(file);
		const {
			matchers,
			assets
		} = collection;

		Object.entries(matchers).forEach(([env, regExp]) => {
			envs.set(env, new RegExp(regExp));
		});

		Object.entries(assets).forEach(([env, container]) => {
			containers.set(env, SSRAssetsContainer.fromJS(env, container));
		});
	}

	/**
	 * Get assets for browser by useragent.
	 * @param  {string} userAgent - UserAgent to match assets.
	 * @return {SSRAssetsContainer} Assets container.
	 */
	match(userAgent) {

		const {
			envs,
			containers
		} = this;
		const matchers = envs.entries();

		for (const [env, regExp] of matchers) {

			if (regExp.test(userAgent)) {
				return containers.get(env);
			}
		}

		return null;
	}
}
