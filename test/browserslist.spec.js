import {
	getBrowserslistQueries,
	getBrowserslistEnvList
} from '../src/browserslist';

describe('bdsl-webpack-plugin', () => {

	describe('browserslist', () => {

		describe('getBrowserslistQueries', () => {

			it('should return default queries', () => {

				const queries = getBrowserslistQueries({
					path: __dirname
				});

				expect(queries).toEqual(['extends browserslist-config-trigen/browsers']);
			});

			it('should return queries by env', () => {

				const queries = getBrowserslistQueries({
					path: __dirname,
					env:  'modern'
				});

				expect(queries).toEqual(['last 2 versions and last 1 year']);
			});
		});

		describe('getBrowserslistEnvList', () => {

			it('should return env list', () => {

				const envList = getBrowserslistEnvList({
					path: __dirname
				});

				expect(envList).toEqual(['modern', 'actual']);
			});
		});
	});
});
