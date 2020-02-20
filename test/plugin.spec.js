import path from 'path';
import compile, {
	fs,
	pathToArtifacts
} from './compile';

describe('bdsl-webpack-plugin', () => {

	it('should emit html file with dsl', async () => {

		const ENV = process.env.NODE_ENV;

		process.env.NODE_ENV = 'production';
		await compile('script.js');
		process.env.NODE_ENV = ENV;

		const html = fs.readFileSync(
			path.join(pathToArtifacts, 'index.html'),
			'utf8'
		);

		expect(html.split('<script>').length).toEqual(2);
		expect(html).toEqual(
			expect.stringMatching(/<script>function dsl\([^)]+\)\{[^}]+\}var [^;]+;switch\(!0\)\{(case .*\.test\(navigator\.userAgent\):dsl\(dsla\[0\],"[^"]+"\);break;){2}default:dsl\(dsla\[0\],"[^"]+"\)\}/)
		);
	});
});
