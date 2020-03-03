
export const ignoreAttrs = [
	'type',
	'src',
	'async',
	'defer',
	'rel',
	'href'
];

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

export function renderDstlFunction() {
	return `function dstl(a,s,c,l,i){
		c=dsld.createElement('link');
		c.rel='stylesheet';
		c.href=s;
		l=a.length;
		for(i=1;i<l;i++)c.setAttribute(a[i][0],a[i][1]);
		dslf.appendChild(c)
	}`.replace(/\n\s*/g, '');
}

export function renderAttrs(scriptsElementsMap) {

	const [, elements] = scriptsElementsMap.entries().next().value;

	return JSON.stringify(
		elements.map(
			({ attributes }) => {

				const {
					async
				} = attributes;
				const entries = Object.entries(attributes).filter(
					([name]) => !ignoreAttrs.includes(name)
				);

				return entries.length || async
					? [Number(async), ...entries]
					: entries;
			}
		)
	);
}

export function renderLoading(elements) {
	return elements.map(
		(element, i) => {

			const isScript = element.tagName === 'script';

			return `${
				isScript
					? 'dsl'
					: 'dstl'
			}(dsla[${i}],${JSON.stringify(
				isScript
					? element.attributes.src
					: element.attributes.href
			)})`;
		}
	).join(',');
}

export function renderDebug(message) {

	if (process.env.NODE_ENV === 'production') {
		return '';
	}

	return `console.log(${JSON.stringify(message)}),`;
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

	return `${dslFunction}${dstlFunction}var dsld=document,dslf=dsld.createDocumentFragment(),dslu=navigator.userAgent,dsla=${attrs};${cases};dsld.all[1].appendChild(dslf)`;
}
