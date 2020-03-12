import path from 'path';
import compile, {
	fs,
	pathToArtifacts
} from './compile';

describe('bdsl-webpack-plugin', () => {

	it('should emit html file with dsl', async () => {

		const ENV = process.env.NODE_ENV;

		process.env.NODE_ENV = 'production';
		await compile();
		process.env.NODE_ENV = ENV;

		const html = fs.readFileSync(
			path.join(pathToArtifacts, 'index.html'),
			'utf8'
		);

		expect(html.split('<script>').length).toEqual(2);
		expect(html).toEqual(
			expect.stringMatching(/<script>function dsl\([^)]+\)\{[^}]+\}/)
		);
	});
});
