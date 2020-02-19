
export class TestClass {

	static staticProp = process.env.BDSL_ENV;

	async asyncMethod() {
		return Math.random();
	}
}
