import {
	getBrowserslistQueries,
	getBrowserslistEnvList
} from '../src';
import {
	setExampleContext
} from './mockContext';

describe('bdsl-webpack-plugin', () => {

	let restoreContext = null;

	beforeAll(() => {
		restoreContext = setExampleContext();
	});

	afterAll(() => {
		restoreContext();
	});

	describe('browserslist', () => {

		describe('getBrowserslistQueries', () => {

			it('should return default queries', () => {

				const queries = getBrowserslistQueries();

				expect(queries).toEqual(['defaults']);
			});

			it('should return queries by env', () => {

				const queries = getBrowserslistQueries({
					env:  'modern'
				});

				expect(queries).toEqual(['last 2 versions and last 1 year and not safari 12.1']);
			});
		});

		describe('getBrowserslistEnvList', () => {

			it('should return env list', () => {

				const envList = getBrowserslistEnvList();

				expect(envList).toEqual(['modern', 'actual']);
			});
		});
	});
});
