/* eslint-disable no-sync */
import fs from 'fs';
import {
	basename
} from 'path';
import {
	loadConfig,
	readConfig,
	findConfig
} from 'browserslist/node';

/**
 * Get queries from Browserslist config.
 * @param  {object} [options] - Browserslist options.
 * @param  {string} [options.path='.'] - Path to config directory.
 * @param  {string} [options.env] - Browserslist config environment.
 * @return {object} Browserslist queries.
 */
export function getBrowserslistQueries({
	path = '.',
	...otherOptions
} = {}) {
	return loadConfig({
		path,
		...otherOptions
	});
}

function parsePackage(file) {

	const {
		browserslist
	} = JSON.parse(
		fs.readFileSync(file)
	);
	const list = Array.isArray(browserslist) || typeof browserslist === 'string'
		? { defaults: browserslist }
		: browserslist;

	return list;
}

/**
 * Get Browserslist config.
 * @param  {object} [options] - Browserslist options.
 * @param  {string} [options.path='.'] - Path to config directory.
 * @param  {string} [options.config] - Path to config.
 * @return {object} Browserslist config.
 */
export function getBrowserslistConfig({
	path = '.',
	config
} = {}) {

	switch (true) {

		case Boolean(process.env.BROWSERSLIST):
			return process.env.BROWSERSLIST;

		case Boolean(config || process.env.BROWSERSLIST_CONFIG): {

			const file = config || process.env.BROWSERSLIST_CONFIG;

			if (basename(file) === 'package.json') {
				return parsePackage(file);
			}

			return readConfig(file);
		}

		case Boolean(path):
			return findConfig(path);

		default:
			return undefined;
	}
}

/**
 * Get Browserslist config's environments, ignoring `defaults` env.
 * @param  {object}   [options] - Browserslist options.
 * @param  {string}   [options.path] - Path to config directory.
 * @param  {string}   [options.config] - Path to config.
 * @return {string[]} Browserslist environments.
 */
export function getBrowserslistEnvList(options) {

	const config = getBrowserslistConfig(options);

	if (config) {
		return Object.keys(config).filter(_ => _ !== 'defaults');
	}

	return [];
}
