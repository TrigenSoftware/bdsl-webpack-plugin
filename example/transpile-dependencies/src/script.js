import {
	Point
} from 'canvg';

export class TestClass {

	static env = process.env.BDSL_ENV;

	userAgent = navigator.userAgent;
	point = new Point('1,2');

	async asyncMethod() {
		return Math.random();
	}

	getBrowserInfo() {
		return `"${this.userAgent}" is "${TestClass.env}" env`;
	}
}

const test = new TestClass();

document.body.innerHTML = test.getBrowserInfo();
