import {
	render,
	renderDw
} from '../src';

describe('bdsl-webpack-plugin', () => {

	describe('render', () => {

		describe('renderAttrs', () => {

			it('should return attributes entries and async flag', () => {

				const elementsMap = new Map([
					['env', [
						{
							tagName:    'script',
							attributes: {
								'data-chunk': 1
							}
						},
						{
							tagName:    'script',
							attributes: {
								'async':      true,
								'data-chunk': 2
							}
						},
						{
							tagName:    'link',
							attributes: {
								'data-chunk': 2
							}
						}
					]]
				]);
				const attrs = render.renderAttrs(elementsMap);

				expect(attrs).toEqual(
					JSON.stringify([
						[0, ['data-chunk', 1]],
						[1, ['data-chunk', 2]],
						[['data-chunk', 2]]
					])
				);
			});
		});

		describe('renderLoading', () => {

			it('should return loading calls', () => {

				const elements = [
					{
						tagName:    'link',
						attributes: {
							href: 'index.css'
						}
					},
					{
						tagName:    'script',
						attributes: {
							src: 'index.js'
						}
					}
				];
				const loading = render.renderLoading(elements);

				expect(loading).toEqual(
					'dstl(dsla[0],"index.css"),dsl(dsla[1],"index.js")'
				);
			});
		});
	});

	describe('render-dw', () => {

		describe('renderAttrs', () => {

			it('should return attributes string', () => {

				const elementsMap = new Map([
					['env', [
						{
							tagName:    'script',
							attributes: {
								'data-chunk': 1
							}
						},
						{
							tagName:    'script',
							attributes: {
								'async':      true,
								'data-chunk': 2
							}
						},
						{
							tagName:    'script',
							attributes: {
								'defer': false
							}
						},
						{
							tagName:    'link',
							attributes: {
								'data-chunk': 2
							}
						}
					]]
				]);
				const attrs = renderDw.renderAttrs(elementsMap);

				expect(attrs).toEqual(
					JSON.stringify([
						'data-chunk=1',
						'async data-chunk=2',
						'defer=false',
						'data-chunk=2'
					])
				);
			});
		});
	});
});
