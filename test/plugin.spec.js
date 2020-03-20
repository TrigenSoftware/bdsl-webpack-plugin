import path from 'path';
import {
	setExampleContext
} from './mockContext';
import compile, {
	fs,
	pathToArtifacts
} from './compile';

describe('bdsl-webpack-plugin', () => {

	const ENV = process.env.NODE_ENV;
	let restoreContext = null;

	beforeAll(() => {
		process.env.NODE_ENV = 'production';
	});

	afterEach(() => {

		if (restoreContext) {
			restoreContext();
		}
	});

	afterAll(() => {
		process.env.NODE_ENV = ENV;
	});

	it('should emit html file with dsl', async () => {

		restoreContext = setExampleContext();

		await compile();

		const html = fs.readFileSync(
			path.join(pathToArtifacts, 'index.html'),
			'utf8'
		);

		expect(html.split('<script>').length).toEqual(2);
		expect(html).toEqual(
			expect.stringMatching(/<script>function dsl\([^)]+\)\{[^}]+\}var/)
		);
	});

	it('should emit html file with dstl', async () => {

		restoreContext = setExampleContext('postcss-preset-env');

		await compile();

		const html = fs.readFileSync(
			path.join(pathToArtifacts, 'index.html'),
			'utf8'
		);

		expect(html.split('<script>').length).toEqual(2);
		expect(html).toEqual(
			expect.stringMatching(/<script>function dsl\([^)]+\)\{[^}]+\}function dstl\([^)]+\)\{[^}]+\}/)
		);
		expect(html).toEqual(
			expect.stringMatching(/<noscript><link href="[^"]*" rel="stylesheet"><\/noscript>/)
		);
	});

	it('should emit html file with `document.write()`', async () => {

		restoreContext = setExampleContext('document-write');

		await compile();

		const html = fs.readFileSync(
			path.join(pathToArtifacts, 'index.html'),
			'utf8'
		);

		expect(html.split('<script>').length).toEqual(2);
		expect(html).toEqual(
			expect.stringMatching(/document\.write\(dslf\)<\/script>/)
		);
	});

	it('should emit html file with module shortcut', async () => {

		restoreContext = setExampleContext('esm');

		await compile();

		const html = fs.readFileSync(
			path.join(pathToArtifacts, 'index.html'),
			'utf8'
		);

		expect(html.split('<script>').length).toEqual(2);
		expect(html).toEqual(
			expect.stringMatching(/'noModule' in dsld\.createElement\('script'\)/)
		);
	});
});
