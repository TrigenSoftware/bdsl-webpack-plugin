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
	'src'
];

export function renderDslFunction() {
	return `function dsl(a,s){
		dslf+='<script src="'+s+'" '+a+'><\\/script>';
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

export function renderDsl(useragentRegExpsMap, scriptsElementsMap) {

	const useragentRegExps = Array.from(
		useragentRegExpsMap.entries()
	);
	const useragentRegExpsLastIndex = useragentRegExps.length - 1;
	const attrs = renderAttrs(scriptsElementsMap);
	const cases = useragentRegExps.map(([
		env,
		useragentRegExp
	], i) => {

		const elements = scriptsElementsMap.get(env);

		if (i === useragentRegExpsLastIndex) {
			return `${renderDebug(env)}${renderLoading(elements)}`;
		}

		return `if(${useragentRegExp}.test(dslu))${renderDebug(env)}${renderLoading(elements)}\n`;
	}).join('else ');

	return `${renderDslFunction()}var dslf='',dslu=navigator.userAgent,dsla=${attrs};${cases};document.write(dslf)`;
}
