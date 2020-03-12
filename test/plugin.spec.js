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

	beforeAll(() => {
		process.env.NODE_ENV = 'production';
	});

	afterAll(() => {
		process.env.NODE_ENV = ENV;
	});

	it('should emit html file with dsl', async () => {

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

		setExampleContext('postcss-preset-env');

		await compile();

		const html = fs.readFileSync(
			path.join(pathToArtifacts, 'index.html'),
			'utf8'
		);

		expect(html.split('<script>').length).toEqual(2);
		expect(html).toEqual(
			expect.stringMatching(/<script>function dsl\([^)]+\)\{[^}]+\}function dstl\([^)]+\)\{[^}]+\}/)
		);
	});

	it('should emit html file with `document.write()`', async () => {

		setExampleContext('document-write');

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
});
