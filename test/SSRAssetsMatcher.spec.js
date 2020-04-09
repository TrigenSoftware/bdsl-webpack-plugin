import MemoryFs from 'memory-fs';
import {
	SSRAssetsCollector,
	SSRAssetsMatcher
} from '../src';

function createAssetsCollection() {

	const modern = 'chrome 80';
	const legacy = 'defaults';
	const collector = new SSRAssetsCollector();

	collector.addEnv({
		browsers: modern
	}, [{
		tagName:    'link',
		attributes: {
			rel:  'stylesheet',
			href: 'index.modern.css'
		}
	}, {
		tagName:    'script',
		attributes: {
			src: 'index.modern.js'
		}
	}], [
		'<link rel="stylesheet" href="index.modern.css">',
		'<script src="index.modern.js"></script>'
	]);

	collector.addEnv({
		browsers: legacy
	}, [{
		tagName:    'link',
		attributes: {
			rel:  'stylesheet',
			href: 'index.legacy.css'
		}
	}, {
		tagName:    'script',
		attributes: {
			src: 'index.legacy.js'
		}
	}], [
		'<link rel="stylesheet" href="index.legacy.css">',
		'<script src="index.legacy.js"></script>'
	]);

	return collector;
}

describe('bdsl-webpack-plugin', () => {

	describe('SSR', () => {

		describe('SSRAssetsMatcher', () => {

			const fs = new MemoryFs();
			const collection = createAssetsCollection();

			fs.writeFileSync('/ssr-bdsl-assets.json', collection.toJson());

			describe('#constructor', () => {

				it('should create from object', () => {

					const assetsCollection = collection.toJS();
					const ssrAssets = new SSRAssetsMatcher({
						assets: assetsCollection
					});

					expect(ssrAssets.defaultEnv).toBe('defaults');

					expect(
						Array.from(
							ssrAssets.envsMap.keys()
						)
					).toEqual(
						Object.keys(assetsCollection.matchers)
					);

					expect(
						Array.from(
							ssrAssets.containersMap.keys()
						)
					).toEqual(
						Object.keys(assetsCollection.assets)
					);
				});

				it('should create from file', () => {

					const assetsCollection = collection.toJS();
					const ssrAssets = new SSRAssetsMatcher({
						assetsFile: '/ssr-bdsl-assets.json',
						fs
					});

					expect(ssrAssets.defaultEnv).toBe('defaults');

					expect(
						Array.from(
							ssrAssets.envsMap.keys()
						)
					).toEqual(
						Object.keys(assetsCollection.matchers)
					);

					expect(
						Array.from(
							ssrAssets.containersMap.keys()
						)
					).toEqual(
						Object.keys(assetsCollection.assets)
					);
				});
			});

			describe('#match', () => {

				it('should match useragent', () => {

					const assetsCollection = collection.toJS();
					const ssrAssets = new SSRAssetsMatcher({
						assets: assetsCollection
					});
					const modernAssets = ssrAssets.match(
						'Chrome/80.0.3987.149'
					);
					const legacyAssets = ssrAssets.match(
						'Chrome/70.0.3987.149'
					);

					expect(modernAssets.toString().split('modern').length).toBe(3);
					expect(legacyAssets.toString().split('legacy').length).toBe(3);
				});
			});
		});
	});
});
