import {
	getEnvName,
	elementsFromJSX
} from '../src';

describe('bdsl-webpack-plugin', () => {

	describe('util', () => {

		describe('getEnvName', () => {

			it('should return default env', () => {

				expect(
					getEnvName()
				).toBe(
					'defaults'
				);
			});

			it('should return given string env', () => {

				expect(
					getEnvName('modern')
				).toBe(
					'modern'
				);
			});

			it('should return env from browsers list', () => {

				expect(
					getEnvName({
						browsers: [
							'last 2 chrome versions',
							'last 2 firefox versions'
						]
					})
				).toBe(
					'last 2 chrome versions, last 2 firefox versions'
				);
			});

			it('should return env from browsers string', () => {

				expect(
					getEnvName({
						browsers: 'last 2 chrome versions'
					})
				).toBe(
					'last 2 chrome versions'
				);
			});

			it('should return env from env', () => {

				expect(
					getEnvName({
						env: 'actual'
					})
				).toBe(
					'actual'
				);
			});

			it('should return env from isModule', () => {

				expect(
					getEnvName({
						isModule: true
					})
				).toBe(
					'module'
				);
			});
		});

		describe('elementsFromJSX', () => {

			it('should transform jsx to element', () => {

				const element = {
					tagName:    'script',
					attributes: {
						defer: true
					}
				};

				expect(
					elementsFromJSX([{
						type:  element.tagName,
						props: element.attributes
					}])
				).toEqual([
					element
				]);
			});

			it('should skip elements', () => {

				const element = {
					tagName:    'script',
					attributes: {
						defer: true
					}
				};
				const resultElements = elementsFromJSX([
					{
						type:  element.tagName,
						props: element.attributes
					},
					element
				]);

				expect(
					resultElements
				).toEqual([
					element,
					element
				]);
				expect(
					resultElements[1]
				).toBe(
					element
				);
			});
		});
	});
});
