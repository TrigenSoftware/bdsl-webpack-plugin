/**
 * @typedef {Partial<import('browserslist-useragent-regexp').IUserAgentRegExpOptions>} Options
 */

/**
 * @typedef {import('./render').HTMLElementObject} HTMLElementObject
 */

/**
 * JSX element inteface.
 * @typedef  {Object} JSXElementObject
 * @property {string}              type - element tag name.
 * @property {Record<string, any>} props - element attributes.
 */

/**
 * Get environment name from options.
 * @param  {Options|string} [options] - BDSL options.
 * @return {string} Environment name.
 */
export function getEnvName(options = {}) {
	return typeof options === 'string'
		? options
		: typeof options.browsers === 'string'
			? options.browsers
			: Array.isArray(options.browsers)
				? options.browsers.join(', ')
				: typeof options.env !== 'undefined'
					? options.env
					: options.isModule
						? 'module'
						: 'defaults';
}

/**
 * Convert JSX elements to HTML elements.
 * @param  {(HTMLElementObject|JSXElementObject)[]} elements - HTML or JSX elements.
 * @return {HTMLElementObject[]} HTML elements.
 */
export function elementsFromJSX(elements) {
	return elements.map(element => (
		element.type && element.props
			? {
				tagName:    element.type,
				attributes: element.props
			}
			: element
	));
}
