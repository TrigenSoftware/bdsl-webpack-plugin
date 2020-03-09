import './style.css';

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
const style = document.getElementsByTagName('link')[0].outerHTML;
const script = document.getElementsByTagName('script')[1].outerHTML;

document.body.innerHTML = `${test.getBrowserInfo()}<br><br>`;
document.body.innerText += style;
document.body.innerHTML += `<br><br>`;
document.body.innerText += script;
