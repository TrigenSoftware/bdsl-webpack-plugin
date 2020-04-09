import {
	SSRAssetsContainer
} from '../src';

describe('SSR', () => {

	describe('SSRAssetsContainer', () => {

		const instance = new SSRAssetsContainer('env');
		const objects = [
			{ tagName: 'a' },
			{ tagName: 'b' },
			{ tagName: 'i' }
		];
		const tags = [
			'<a>',
			'<b>',
			'<i>'
		];

		instance.add(objects, tags);

		describe('#constructor', () => {

			it('should create instance', () => {

				const instance = new SSRAssetsContainer('env');

				expect(instance.env).toBe('env');
				expect(instance.isReadOnly).toBe(false);
				expect(instance.objects).toEqual([]);
				expect(instance.tags).toEqual([]);

				instance.add([], []);
			});

			it('should create read-only instance', () => {

				const instance = new SSRAssetsContainer('env', true);

				expect(instance.env).toBe('env');
				expect(instance.isReadOnly).toBe(true);
				expect(instance.objects).toEqual([]);
				expect(instance.tags).toEqual([]);

				expect(() => {
					instance.add([], []);
				}).toThrowError(/read-only/);
			});

			it('should create instance from JS object', () => {

				const instance = SSRAssetsContainer.fromJS('env', {
					objects,
					tags
				});

				expect(instance.env).toBe('env');
				expect(instance.isReadOnly).toBe(true);
				expect(instance.objects).toEqual(objects);
				expect(instance.tags).toEqual(tags);
			});
		});

		describe('#getObjects', () => {

			it('should return objects', () => {

				const objectsFromInstance = instance.getObjects();

				expect(objectsFromInstance).not.toBe(objects);
				expect(objectsFromInstance).toEqual(objects);
			});
		});

		describe('#getTags', () => {

			it('should return tags', () => {

				const tagsFromInstance = instance.getTags();

				expect(tagsFromInstance).not.toBe(tags);
				expect(tagsFromInstance).toEqual(tags);
			});
		});

		describe('#toHtml', () => {

			it('should return HTML', () => {

				expect(
					instance.toHtml()
				).toBe('<a><b><i>');
			});

			it('should return beautified HTML', () => {

				expect(
					instance.toHtml(true)
				).toBe('<a>\n<b>\n<i>');
			});
		});

		describe('#toString', () => {

			it('should return HTML string', () => {

				expect(
					instance.toString()
				).toBe('<a><b><i>');
			});
		});

		describe('#toJS', () => {

			it('should return JS object', () => {

				expect(
					instance.toJS()
				).toEqual({
					objects,
					tags
				});
			});
		});
	});
});
