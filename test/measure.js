/* eslint-disable no-console */
import puppeteer from 'puppeteer';
import formatBytes from 'pretty-bytes';
import formatTime from 'pretty-ms';

const WARM_TIMES = 1;
const MEASURE_TIMES = process.env.MEASURE_TIMES
	? parseInt(process.env.MEASURE_TIMES, 10)
	: 10;
const formatTimeOptions = {
	separateMilliseconds: true
};
const good3g = process.argv.includes('--good3g');
const regular4g = process.argv.includes('--regular4g');
const cache = process.argv.includes('--cache');
const urls = process.argv.splice(2).filter(_ => !_.startsWith('-'));

async function customizePage(page, {
	good3g,
	regular4g,
	cache
}) {

	await page.setViewport({
		width:  1920,
		height: 1080
	});
	await page._client.send('Network.setBypassServiceWorker', {
		bypass: true
	});

	if (!cache) {
		await page.setCacheEnabled(false);
	}

	if (good3g) {
		await page._client.send('Network.emulateNetworkConditions', {
			offline:            false,
			downloadThroughput: 1.5 * 1024 * 1024 / 8,
			uploadThroughput:   750 * 1024 / 8,
			latency:            40
		});
	}

	if (regular4g) {
		await page._client.send('Network.emulateNetworkConditions', {
			offline:            false,
			downloadThroughput: 4 * 1024 * 1024 / 8,
			uploadThroughput:   3 * 1024 * 1024 / 8,
			latency:            20
		});
	}
}

async function getMetrics(page, url) {

	const loadTime = await page.evaluate(
		// eslint-disable-next-line no-undef
		() => performance.timing.loadEventEnd - performance.timing.fetchStart
	);
	const resources = await page.evaluate(
		// eslint-disable-next-line no-undef
		url => performance.getEntries().reduce((resoueces, entry) => {

			if (entry.entryType !== 'resource'
				|| !entry.name.startsWith(url)
				|| !/\.(js|css)$/.test(entry.name)
			) {
				return resoueces;
			}

			return [
				...resoueces,
				{
					name:        entry.name,
					encodedSize: entry.encodedBodySize,
					decodedSize: entry.decodedBodySize
				}
			];
		}, []),
		url
	);
	const resourcesSize = resources.reduce((resourcesSize, resource) => ({
		encodedSize: resourcesSize.encodedSize + resource.encodedSize,
		decodedSize: resourcesSize.decodedSize + resource.decodedSize
	}), {
		encodedSize: 0,
		decodedSize: 0
	});

	return {
		loadTime,
		resourcesSize,
		resources
	};
}

async function measurePage(page, url) {

	const stats = [];

	// warm
	for (let i = 0; i < WARM_TIMES; i++) {

		await page.goto(url, {
			waitUntil: 'load'
		});
	}

	for (let i = 0; i < MEASURE_TIMES; i++) {

		await page.goto(url, {
			waitUntil: 'load'
		});

		stats.push(
			await getMetrics(page, url)
		);
	}

	return stats;
}

function printSummary(stats) {

	const summary = stats.reduce((summary, {
		resourcesSize,
		loadTime
	}) => ({
		...resourcesSize,
		fastestTime: summary.fastestTime === 0
			? loadTime
			: Math.min(summary.fastestTime, loadTime),
		slowestTime: summary.slowestTime === 0
			? loadTime
			: Math.max(summary.slowestTime, loadTime),
		averageTime: summary.averageTime === 0
			? loadTime
			: (summary.averageTime + loadTime) / 2
	}), {
		averageTime: 0,
		fastestTime: 0,
		slowestTime: 0,
		encodedSize: 0,
		decodedSize: 0
	});

	console.log('Average time:', formatTime(summary.averageTime, formatTimeOptions));
	console.log('Fastest time:', formatTime(summary.fastestTime, formatTimeOptions));
	console.log('Slowest time:', formatTime(summary.slowestTime, formatTimeOptions));
	console.log('Encoded size:', formatBytes(summary.encodedSize));
	console.log('Decoded size:', formatBytes(summary.decodedSize));
}

async function measureSites(urls, opts) {

	const browser = await puppeteer.launch();

	for (const url of urls) {

		console.log(`\n${url}\n`);

		const page = await browser.newPage();

		await customizePage(page, opts);

		printSummary(
			await measurePage(page, url)
		);

		await page.close();
	}

	await browser.close();
}

measureSites(urls, {
	good3g,
	regular4g,
	cache
});
