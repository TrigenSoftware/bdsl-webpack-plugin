
export function renderDslFunction() {
	return `function dsl(a,s,c,l,i){
		c=document.createElement('script'),l=a.length;
		for(i=0;i<l;i++)c.setAttribute(a[i][0], a[i][1]);
		c.setAttribute('src',s);
		dslh.appendChild(c)
	}`.replace(/\n\s*/g, '');
}

export function renderAttrs(scriptsElementsMap) {

	const [, elements] = scriptsElementsMap.entries().next().value;

	return JSON.stringify(
		elements.map(
			element => Object.entries(element.attributes).filter(
				([name]) => name !== 'src' && name !== 'type'
			)
		)
	);
}

export function renderLoading(elements) {
	return elements.map(
		(element, i) => `dsl(dsla[${i}],${JSON.stringify(element.attributes.src)})`
	).join(',');
}

export function renderDebug(message) {

	if (process.env.NODE_ENV === 'production') {
		return '';
	}

	return `console.log(${JSON.stringify(message)}),`;
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

	return `${renderDslFunction()}var dslh=document.getElementsByTagName('head')[0],dslu=navigator.userAgent,dsla=${attrs};${cases}`;
}
