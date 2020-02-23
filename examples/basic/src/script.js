import whenDomReady from 'when-dom-ready';

export class TestClass {

	static env = process.env.BDSL_ENV;

	userAgent = navigator.userAgent;

	async asyncMethod() {
		return Math.random();
	}

	getBrowserInfo() {
		return `"${this.userAgent}" is "${TestClass.env}" env`;
	}
}

const test = new TestClass();

whenDomReady(() => {

	const script = document.getElementsByTagName('script')[1].outerHTML;

	document.body.innerHTML = `${test.getBrowserInfo()}<br><br>`;
	document.body.innerText += script;
});
