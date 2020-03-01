import whenDomReady from 'when-dom-ready';

export class TestClass {

	static env = process.env.BDSL_ENV;

	userAgent = navigator.userAgent;
	pr = Promise.resolve();

	async asyncMethod() {
		return Math.random();
	}

	getBrowserInfo() {
		return `"${this.userAgent}" is "${TestClass.env}" env`;
	}
}

const test = new TestClass();
const isDeferWorks = Boolean(document.getElementById('test159'));

whenDomReady(() => {

	const script = document.getElementsByTagName('script')[1].outerHTML;
	const output = document.getElementById('output');

	output.innerHTML = `${test.getBrowserInfo()}<br><br>`;
	output.innerText += script;

	if (isDeferWorks) {
		output.innerHTML += `<br><br>defer is works`;
	}
});
