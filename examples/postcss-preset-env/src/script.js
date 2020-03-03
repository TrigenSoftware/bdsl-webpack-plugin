import whenDomReady from 'when-dom-ready';
import './style.css';

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

whenDomReady(() => {

	const style = document.getElementsByTagName('link')[0].outerHTML;
	const script = document.getElementsByTagName('script')[1].outerHTML;

	document.body.innerHTML = `${test.getBrowserInfo()}<br><br>`;
	document.body.innerText += style;
	document.body.innerHTML += `<br><br>`;
	document.body.innerText += script;
});
