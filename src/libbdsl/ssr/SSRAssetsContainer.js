/**
 * @typedef {import('../render').HTMLElementObject} HTMLElementObject
 */

/**
 * SSR Assets Container.
 */
export class SSRAssetsContainer {

	/**
	 * Create assets container from JS object.
	 * @param  {string} env - Environment name.
	 * @param  {object} object - JS object.
	 * @return {SSRAssetsContainer} Container.
	 */
	static fromJS(env, {
		objects,
		tags
	}) {

		const container = new SSRAssetsContainer(env, true);

		container.objects.push(...objects);
		container.tags.push(...tags);

		return container;
	}

	/**
	 * SSR Assets Container.
	 * @param {string}  env - Environment name.
	 * @param {boolean} [isReadOnly=false] - Is read-only container.
	 */
	constructor(env, isReadOnly = false) {

		/**
		 * @type {string}
		 */
		this.env = env;

		/**
		 * @type {boolean}
		 */
		this.isReadOnly = isReadOnly;

		/**
		 * @type {HTMLElementObject[]}
		 */
		this.objects = [];

		/**
		 * @type {string[]}
		 */
		this.tags = [];
	}

	/**
	 * Add asset.
	 * @param  {HTMLElementObject|HTMLElementObject[]} objects - HTML element object.
	 * @param  {string|string[]} tags - HTML element string.
	 * @return {SSRAssetsContainer} This container.
	 */
	add(objects, tags) {

		const {
			isReadOnly
		} = this;

		if (isReadOnly) {
			throw new Error(`Can't add asset: this container is read-only.`);
		}

		if (Array.isArray(objects)) {
			this.objects.push(...objects);
		} else {
			this.objects.push(objects);
		}

		if (Array.isArray(tags)) {
			this.tags.push(...tags);
		} else {
			this.tags.push(tags);
		}

		return this;
	}

	/**
	 * Get HTML elements objects.
	 * @return {HTMLElementObject[]} HTML elements objects.
	 */
	getObjects() {
		return this.objects;
	}

	/**
	 * Get HTML elements strings.
	 * @return {string[]} HTML elements strings.
	 */
	getTags() {
		return this.tags;
	}

	/**
	 * Get HTML elements string from container.
	 * @param  {boolean} [beautify=false] - Beautify output.
	 * @return {string} HTML elements string.
	 */
	toHtml(beautify = false) {
		return this.tags.join(beautify ? '\n' : '');
	}

	/**
	 * Get HTML elements string from container.
	 * @return {string} HTML elements string.
	 */
	toString() {
		return this.toHtml();
	}

	/**
	 * Get JS object from container.
	 * @return {object} JS object.
	 */
	toJS() {
		return {
			objects: this.objects.map(obj => ({ ...obj })),
			tags:    [...this.tags]
		};
	}
}
