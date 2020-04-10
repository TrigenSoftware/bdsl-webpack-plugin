/* eslint-disable no-console */
import path from 'path';
import { promises as fs } from 'fs';
import express from 'express';
import {
	SSRAssetsMatcher
} from 'bdsl-webpack-plugin';

const PORT = 8080;
const STATIC = path.join(__dirname, '..', '..', 'test', 'artifacts');
const indexAccess = fs.readFile(path.join(STATIC, 'index.html'), 'utf8');
const app = express();
const assetsMatcher = new SSRAssetsMatcher({
	assetsFile: path.join(STATIC, 'ssr-bdsl-assets.json')
});

app.get('/', async (request, response) => {

	const userAgent = request.get('User-Agent');
	const template = await indexAccess;
	const assets = assetsMatcher.match(userAgent);
	const index = template.replace('<ssr-placeholder></ssr-placeholder>', assets.toHtml());

	console.log(userAgent, 'is', assets.env);

	response.send(index);
});

app.use(express.static(STATIC));
app.listen(PORT);
