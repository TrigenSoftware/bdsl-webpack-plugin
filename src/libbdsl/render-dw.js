import {
	renderLoading,
	renderDebug
} from './render';

export {
	renderLoading,
	renderDebug
};

/**
 * @typedef {import('./render').HTMLElementObject} HTMLElementObject
 */

/**
 * @type {string[]}
 */
export const ignoreAttrs = [
	'type',
	'src',
	'rel',
	'href'
];

/**
 * Get function for collect scripts.
 * @return {string} function string.
 */
export function renderDslFunction() {
	return `function dsl(a,s){
		dslf+='<script src="'+s+'" '+a+'><\\/script>';
	}`.replace(/\n\s*/g, '');
}

/**
 * Get function for collect links.
 * @return {string} function string.
 */
export function renderDstlFunction() {
	return `function dstl(a,s){
		dslf+='<link rel="stylesheet" href="'+s+'" '+a+'>';
	}`.replace(/\n\s*/g, '');
}

/**
 * Get serialized element's attributes.
 * @param  {Map<string, HTMLElementObject[]>} elementsMap - Env-to-elements map.
 * @return {string} Serialized attributes.
 */
export function renderAttrs(elementsMap) {

	const [, elements] = elementsMap.entries().next().value;

	return JSON.stringify(
		elements.map(
			({ attributes }) => {

				const entries = Object.entries(attributes).filter(
					([name]) => !ignoreAttrs.includes(name)
				);
				const attributesString = entries.map(([name, value]) => (
					value
						? name
						: `${name}=${JSON.stringify(value)}`
				)).join(' ');

				return attributesString;
			}
		)
	);
}

/**
 * Get dsl code string.
 * @param  {Map<string, RegExp>}              useragentRegExpsMap - Env-to-regexp map.
 * @param  {Map<string, HTMLElementObject[]>} elementsMap - Env-to-elements map.
 * @param  {boolean}                          debug - Print debug information.
 * @return {string} Code string.
 */
export function renderDsl(useragentRegExpsMap, elementsMap, debug = false) {

	const useragentRegExps = Array.from(
		useragentRegExpsMap.entries()
	);
	const useragentRegExpsLastIndex = useragentRegExps.length - 1;
	const attrs = renderAttrs(elementsMap);
	let withDsl = false;
	let withDstl = false;
	const cases = useragentRegExps.map(([
		env,
		useragentRegExp
	], i) => {

		const elements = elementsMap.get(env);
		const loading = renderLoading(elements);

		if (/dsl\(/.test(loading)) {
			withDsl = true;
		}

		if (/dstl\(/.test(loading)) {
			withDstl = true;
		}

		if (i === useragentRegExpsLastIndex) {
			return `${renderDebug(debug, env)}${loading}`;
		}

		return `if(${useragentRegExp}.test(dslu))${renderDebug(debug, env)}${loading}\n`;
	}).join('else ');
	const dslFunction = withDsl
		? renderDslFunction()
		: '';
	const dstlFunction = withDstl
		? renderDstlFunction()
		: '';

	return `${dslFunction}${dstlFunction}var dslf='',dslu=navigator.userAgent,dsla=${attrs};${cases};document.write(dslf)`;
}
