import {
	renderLoading,
	renderDebug
} from './render';

export {
	renderLoading,
	renderDebug
};

export const ignoreAttrs = [
	'type',
	'src',
	'rel',
	'href'
];

export function renderDslFunction() {
	return `function dsl(a,s){
		dslf+='<script src="'+s+'" '+a+'><\\/script>';
	}`.replace(/\n\s*/g, '');
}

export function renderDstlFunction() {
	return `function dstl(a,s){
		dslf+='<link rel="stylesheet" href="'+s+'" '+a+'>';
	}`.replace(/\n\s*/g, '');
}

export function renderAttrs(scriptsElementsMap) {

	const [, elements] = scriptsElementsMap.entries().next().value;

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

export function renderDsl(useragentRegExpsMap, elementsMap) {

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
			return `${renderDebug(env)}${loading}`;
		}

		return `if(${useragentRegExp}.test(dslu))${renderDebug(env)}${loading}\n`;
	}).join('else ');
	const dslFunction = withDsl
		? renderDslFunction()
		: '';
	const dstlFunction = withDstl
		? renderDstlFunction()
		: '';

	return `${dslFunction}${dstlFunction}var dslf='',dslu=navigator.userAgent,dsla=${attrs};${cases};document.write(dslf)`;
}
