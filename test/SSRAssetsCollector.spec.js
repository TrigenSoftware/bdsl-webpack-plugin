import {
	SSRAssetsCollector
} from '../src';

describe('bdsl-webpack-plugin', () => {

	describe('SSR', () => {

		describe('SSRAssetsCollector', () => {

			const objects = [
				{ tagName: 'script', attributes: { src: 'index.modern.js' } },
				{ tagName: 'script', attributes: { src: 'index.actual.js' } },
				{ tagName: 'script', attributes: { src: 'index.legacy.js' } }
			];
			const tags = [
				'<script src="index.modern.js"></script>',
				'<script src="index.actual.js"></script>',
				'<script src="index.legacy.js"></script>'
			];

			describe('#isCollected', () => {

				it('should return true', () => {

					const collector = new SSRAssetsCollector();

					collector.envsMap.set('env1', '');
					collector.envsMap.set('env2', '');

					expect(
						collector.isCollected()
					).toBe(
						true
					);
				});

				it('should return false', () => {

					const collector = new SSRAssetsCollector();

					expect(
						collector.isCollected()
					).toBe(
						false
					);

					collector.envsMap.set('env1', '');

					expect(
						collector.isCollected()
					).toBe(
						false
					);
				});
			});

			describe('#isFilled', () => {

				it('should return true', () => {

					const collector = new SSRAssetsCollector();

					collector.envsMap.set('env1', '');
					collector.envsMap.set('env2', '');
					collector.containersMap.set('env1', {});
					collector.containersMap.set('env2', {});

					expect(
						collector.isFilled()
					).toBe(
						true
					);
				});

				it('should return false', () => {

					const collector = new SSRAssetsCollector();

					expect(
						collector.isFilled()
					).toBe(
						false
					);

					collector.envsMap.set('env1', '');
					collector.containersMap.set('env1', {});

					expect(
						collector.isFilled()
					).toBe(
						false
					);

					collector.envsMap.set('env2', '');

					expect(
						collector.isFilled()
					).toBe(
						false
					);

					collector.containersMap.set('env3', {});

					expect(
						collector.isFilled()
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
					const collector = new SSRAssetsCollector();

					collector.addEnv({
						browsers: modern
					}, modernElements, ['']);
					collector.addEnv({
						browsers: defaults
					}, defaultsElements, ['']);

					expect(
						collector.getDefaultEnvElements()
					).toEqual(
						defaultsElements
					);
					expect(
						collector.getDefaultEnvElements()
					).not.toEqual(
						modernElements
					);
				});
			});

			describe('#addEnv', () => {

				it('should add env', () => {

					const browsers = 'last 2 chrome versions';
					const collector = new SSRAssetsCollector();

					collector.addEnv({
						browsers
					});

					expect(
						String(collector.envsMap.get(browsers))
					).toEqual(
						expect.stringMatching(/Chrome/)
					);

					expect(
						collector.containersMap.size
					).toBe(
						0
					);
				});

				it('should add env and assets', () => {

					const browsers = 'last 2 chrome versions';
					const collector = new SSRAssetsCollector();

					collector.addEnv({
						browsers
					}, objects, tags);

					expect(
						String(collector.envsMap.get(browsers))
					).toEqual(
						expect.stringMatching(/Chrome/)
					);

					expect(
						collector.containersMap.get(browsers).toJS()
					).toEqual({
						objects,
						tags
					});
				});
			});

			describe('#setEnvAssets', () => {

				it('should set env assets', () => {

					const browsers = 'last 2 chrome versions';
					const collector = new SSRAssetsCollector();

					expect(
						collector.containersMap.size
					).toBe(
						0
					);

					collector.setEnvAssets(browsers, objects, tags);

					expect(
						collector.containersMap.size
					).toBe(
						1
					);
				});
			});

			describe('#toJS', () => {

				it('should return assets collection', () => {

					const modern = 'last 2 chrome versions';
					const actual = 'last 10 chrome versions';
					const defaults = 'defaults';
					const collector = new SSRAssetsCollector();

					collector.addEnv({
						browsers: modern
					}, [objects[0]], [tags[0]]);
					collector.addEnv({
						browsers: actual
					}, [objects[1]], [tags[1]]);
					collector.addEnv({
						browsers: defaults
					}, [objects[2]], [tags[2]]);

					expect(collector.toJS()).toMatchObject({
						matchers: {
							[modern]:   expect.any(String),
							[actual]:   expect.any(String),
							[defaults]: expect.any(String)
						},
						assets: {
							[modern]:   {
								objects: [objects[0]],
								tags:    [tags[0]]
							},
							[actual]:   {
								objects: [objects[1]],
								tags:    [tags[1]]
							},
							[defaults]: {
								objects: [objects[2]],
								tags:    [tags[2]]
							}
						}
					});
				});
			});

			describe('#toJson', () => {

				it('should return assets collection', () => {

					const modern = 'last 2 chrome versions';
					const actual = 'last 10 chrome versions';
					const defaults = 'defaults';
					const collector = new SSRAssetsCollector();

					collector.addEnv({
						browsers: modern
					}, [objects[0]], [tags[0]]);
					collector.addEnv({
						browsers: actual
					}, [objects[1]], [tags[1]]);
					collector.addEnv({
						browsers: defaults
					}, [objects[2]], [tags[2]]);

					expect(JSON.parse(collector.toJson())).toMatchObject({
						matchers: {
							[modern]:   expect.any(String),
							[actual]:   expect.any(String),
							[defaults]: expect.any(String)
						},
						assets: {
							[modern]:   {
								objects: [objects[0]],
								tags:    [tags[0]]
							},
							[actual]:   {
								objects: [objects[1]],
								tags:    [tags[1]]
							},
							[defaults]: {
								objects: [objects[2]],
								tags:    [tags[2]]
							}
						}
					});
				});
			});
		});
	});
});
