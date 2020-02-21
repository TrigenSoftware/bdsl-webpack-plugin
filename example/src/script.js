
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

document.addEventListener('DOMContentLoaded', () => {
	document.body.innerHTML = test.getBrowserInfo();
});
