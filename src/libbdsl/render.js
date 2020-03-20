/**
 * HTML element inteface.
 * @typedef  {Object} HTMLElementObject
 * @property {string}              tagName - element tag name.
 * @property {Record<string, any>} attributes - element attributes.
 */

/**
 * @type {string[]}
 */
export const ignoreAttrs = [
	'type',
	'src',
	'async',
	'defer',
	'rel',
	'href'
];

/**
 * Get function for collect scripts.
 * @return {string} Function string.
 */
export function renderDslFunction() {
	return `function dsl(a,s,c,l,i){
		c=dsld.createElement('script');
		c.async=a[0];
		c.src=s;
		l=a.length;
		for(i=1;i<l;i++)c.setAttribute(a[i][0],a[i][1]);
		dslf.appendChild(c)
	}`.replace(/\n\s*/g, '');
}

/**
 * Get function for collect links.
 * @return {string} Function string.
 */
export function renderDstlFunction() {
	return `function dstl(a,s,c,l,i){
		c=dsld.createElement('link');
		c.rel='stylesheet';
		c.href=s;
		l=a.length;
		for(i=0;i<l;i++)c.setAttribute(a[i][0],a[i][1]);
		dslf.appendChild(c)
	}`.replace(/\n\s*/g, '');
}

/**
 * Get `type=module` support check.
 * @return {string} - Test string.
 */
export function renderModuleTest() {
	return "'noModule' in dsld.createElement('script')";
}

/**
 * Get useragent RegExp test.
 * @param  {RegExp} regExp - Regular expression to test.
 * @return {string} - UserAgent test string.
 */
export function renderUserAgentRegExpTest(regExp) {
	return `${regExp}.test(dslu)`;
}

/**
 * Get serialized element's attributes.
 * @param  {Map<string, HTMLElementObject[]>} elementsMap - Env-to-elements map.
 * @return {string} Serialized attributes.
 */
export function renderAttrs(elementsMap) {

	/**
	 * @type {[string, HTMLElementObject[]]}
	 */
	const [, elements] = elementsMap.entries().next().value;

	return JSON.stringify(
		elements.map(
			({
				tagName,
				attributes
			}) => {

				const {
					async
				} = attributes;
				const entries = Object.entries(attributes).filter(
					([name]) => !ignoreAttrs.includes(name)
				);

				return tagName === 'script' && (entries.length || async)
					? [Number(Boolean(async)), ...entries]
					: entries;
			}
		)
	);
}

/**
 * Get dsl/dstl function calls for elements.
 * @param  {HTMLElementObject[]} elements - script/link elements array.
 * @return {string} Functions calls string.
 */
export function renderLoading(elements) {
	return elements.map(
		({
			tagName,
			attributes
		}, i) => {

			const isScript = tagName === 'script';

			return `${
				isScript
					? 'dsl'
					: 'dstl'
			}(dsla[${i}],${JSON.stringify(
				isScript
					? attributes.src
					: attributes.href
			)})`;
		}
	).join(',');
}

/**
 * Get debug message log.
 * @param  {boolean} debug - Print debug information or not.
 * @param  {string}  message - Message to log.
 * @return {string} Debug message print string.
 */
export function renderDebug(debug, message) {

	if (!debug) {
		return '';
	}

	return `console.log(${JSON.stringify(message)}),`;
}

/**
 * Get dsl code string.
 * @param  {Map<string, string>}              testersMap - Env-to-regexp map.
 * @param  {Map<string, HTMLElementObject[]>} elementsMap - Env-to-elements map.
 * @param  {boolean}                          debug - Print debug information.
 * @return {string} Code string.
 */
export function renderDsl(testersMap, elementsMap, debug = false) {

	const testers = Array.from(
		testersMap.entries()
	);
	const testersLastIndex = testers.length - 1;
	const attrs = renderAttrs(elementsMap);
	let withDsl = false;
	let withDstl = false;
	const cases = testers.map(([
		env,
		tester
	], i) => {

		const elements = elementsMap.get(env);
		const loading = renderLoading(elements);

		if (/dsl\(/.test(loading)) {
			withDsl = true;
		}

		if (/dstl\(/.test(loading)) {
			withDstl = true;
		}

		if (i === testersLastIndex) {
			return `${renderDebug(debug, env)}${loading}`;
		}

		return `if(${tester})${renderDebug(debug, env)}${loading}\n`;
	}).join('else ');
	const dslFunction = withDsl
		? renderDslFunction()
		: '';
	const dstlFunction = withDstl
		? renderDstlFunction()
		: '';

	return `${dslFunction}${dstlFunction}var dsld=document,dslf=dsld.createDocumentFragment(),dslu=navigator.userAgent,dsla=${attrs};${cases};dsld.all[1].appendChild(dslf)`;
}
