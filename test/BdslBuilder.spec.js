import {
	BdslBuilder
} from '../src';

describe('bdsl-webpack-plugin', () => {

	describe('BdslBuilder', () => {

		describe('#isBuildable', () => {

			it('should return true', () => {

				const builder = new BdslBuilder();

				builder.testersMap.set('env1', '');
				builder.testersMap.set('env2', '');

				expect(
					builder.isBuildable()
				).toBe(
					true
				);
			});

			it('should return false', () => {

				const builder = new BdslBuilder();

				expect(
					builder.isBuildable()
				).toBe(
					false
				);

				builder.testersMap.set('env1', '');

				expect(
					builder.isBuildable()
				).toBe(
					false
				);
			});
		});

		describe('#isFilled', () => {

			it('should return true', () => {

				const builder = new BdslBuilder();

				builder.testersMap.set('env1', '');
				builder.testersMap.set('env2', '');
				builder.elementsMap.set('env1', []);
				builder.elementsMap.set('env2', []);

				expect(
					builder.isFilled()
				).toBe(
					true
				);
			});

			it('should return false', () => {

				const builder = new BdslBuilder();

				expect(
					builder.isFilled()
				).toBe(
					false
				);

				builder.testersMap.set('env1', '');
				builder.elementsMap.set('env1', []);

				expect(
					builder.isFilled()
				).toBe(
					false
				);

				builder.testersMap.set('env2', '');

				expect(
					builder.isFilled()
				).toBe(
					false
				);

				builder.elementsMap.set('env3', []);

				expect(
					builder.isFilled()
				).toBe(
					false
				);
			});
		});

		describe('#getDefaultEnvElements', () => {

			it('should return elements for default env', () => {

				const modern = 'last 2 chrome versions';
				const defaults = 'defaults';
				const modernElements = [{
					modern: true
				}];
				const defaultsElements = [{
					defaults: true
				}];
				const builder = new BdslBuilder();

				builder.addEnv({
					browsers: modern
				}, modernElements);
				builder.addEnv({
					browsers: defaults
				}, defaultsElements);

				expect(
					builder.getDefaultEnvElements()
				).toEqual(
					defaultsElements
				);
				expect(
					builder.getDefaultEnvElements()
				).not.toEqual(
					modernElements
				);
			});
		});

		describe('#addEnv', () => {

			it('should add env', () => {

				const browsers = 'last 2 chrome versions';
				const builder = new BdslBuilder();

				builder.addEnv({
					browsers
				});

				expect(
					builder.testersMap.get(browsers)
				).toEqual(
					expect.stringMatching(/Chrome/)
				);

				expect(
					builder.testersMap.get(browsers)
				).toEqual(
					expect.stringMatching(/\.test\(dslu\)/)
				);

				expect(
					builder.elementsMap.size
				).toBe(
					0
				);
			});

			it('should add env and elements', () => {

				const browsers = 'last 2 chrome versions';
				const builder = new BdslBuilder();

				builder.addEnv({
					browsers
				}, []);

				expect(
					builder.testersMap.get(browsers)
				).toEqual(
					expect.stringMatching(/Chrome/)
				);

				expect(
					builder.testersMap.get(browsers)
				).toEqual(
					expect.stringMatching(/\.test\(dslu\)/)
				);

				expect(
					builder.elementsMap.get(browsers)
				).toEqual(
					[]
				);
			});

			it('should add module env', () => {

				const browsers = 'last 2 chrome versions';
				const builder = new BdslBuilder();

				builder.addEnv({
					isModule: true,
					browsers
				});

				expect(
					builder.testersMap.get(browsers)
				).toEqual(
					expect.stringMatching(/^'noModule' in dsld\.createElement\('script'\)$/)
				);

				expect(
					builder.elementsMap.size
				).toBe(
					0
				);
			});
		});

		describe('#setEnvElements', () => {

			it('should set elements', () => {

				const browsers = 'last 2 chrome versions';
				const builder = new BdslBuilder();

				expect(
					builder.elementsMap.size
				).toBe(
					0
				);

				builder.setEnvElements(browsers, []);

				expect(
					builder.elementsMap.size
				).toBe(
					1
				);
			});
		});

		describe('#build', () => {

			it('should build dsl script', () => {

				const modern = 'last 2 chrome versions';
				const actual = 'last 10 chrome versions';
				const defaults = 'defaults';
				const builder = new BdslBuilder();

				builder.addEnv({
					browsers: modern
				}, [{
					tagName:    'script',
					attributes: {
						defer: true,
						src:   'index.modern.js'
					}
				}]);
				builder.addEnv({
					browsers: actual
				}, [{
					tagName:    'script',
					attributes: {
						defer: true,
						src:   'index.actual.js'
					}
				}]);
				builder.addEnv({
					browsers: defaults
				}, [{
					tagName:    'script',
					attributes: {
						defer: true,
						src:   'index.defaults.js'
					}
				}]);

				const dsl = builder.build({
					debug: false
				});

				expect(
					dsl
				).toEqual(
					expect.stringMatching(/^function dsl\([^)]+\)\{[^}]+\}var [^;]+;if\(.*\.test\(dslu\)\)dsl\(dsla\[0\],"[^"]+"\)\nelse if\(.*\.test\(dslu\)\)dsl\(dsla\[0\],"[^"]+"\)\nelse dsl\(dsla\[0\],"[^"]+"\)/)
				);
			});

			it('should build dsl script with `document.write()`', () => {

				const modern = 'last 2 chrome versions';
				const actual = 'last 10 chrome versions';
				const defaults = 'defaults';
				const builder = new BdslBuilder({
					unsafeUseDocumentWrite: true
				});

				builder.addEnv({
					browsers: modern
				}, [{
					tagName:    'script',
					attributes: {
						defer: true,
						src:   'index.modern.js'
					}
				}]);
				builder.addEnv({
					browsers: actual
				}, [{
					tagName:    'script',
					attributes: {
						defer: true,
						src:   'index.actual.js'
					}
				}]);
				builder.addEnv({
					browsers: defaults
				}, [{
					tagName:    'script',
					attributes: {
						defer: true,
						src:   'index.defaults.js'
					}
				}]);

				const dsl = builder.build({
					debug: false
				});

				expect(
					dsl
				).toEqual(
					expect.stringMatching(/document\.write/)
				);
			});

			it('should build dsl script with module shortcut', () => {

				const modern = 'last 2 chrome versions';
				const actual = 'last 10 chrome versions';
				const defaults = 'defaults';
				const builder = new BdslBuilder();

				builder.addEnv({
					isModule: true,
					browsers: modern
				}, [{
					tagName:    'script',
					attributes: {
						defer: true,
						src:   'index.modern.js'
					}
				}]);
				builder.addEnv({
					browsers: actual
				}, [{
					tagName:    'script',
					attributes: {
						defer: true,
						src:   'index.actual.js'
					}
				}]);
				builder.addEnv({
					browsers: defaults
				}, [{
					tagName:    'script',
					attributes: {
						defer: true,
						src:   'index.defaults.js'
					}
				}]);

				const dsl = builder.build({
					debug: false
				});

				expect(
					dsl
				).toEqual(
					expect.stringMatching(/^function dsl\([^)]+\)\{[^}]+\}var [^;]+;if\('noModule' in dsld\.createElement\('script'\)\)dsl\(dsla\[0\],"[^"]+"\)\nelse if\(.*\.test\(dslu\)\)dsl\(dsla\[0\],"[^"]+"\)\nelse dsl\(dsla\[0\],"[^"]+"\)/)
				);
			});
		});
	});
});
