import path from 'path';
import {
	addAlias
} from 'module-alias';

export const context = path.join(__dirname, '..', 'example');
const src = path.join(__dirname, '..', 'src');

process.chdir(context);

if (typeof jest === 'undefined') {
	addAlias('bdsl-webpack-plugin', src);
}
