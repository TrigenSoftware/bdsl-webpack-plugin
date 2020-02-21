import path from 'path';
import {
	addAlias
} from 'module-alias';

export const context = path.join(__dirname, '..', 'example');

process.chdir(context);
addAlias('bdsl-webpack-plugin', path.join(__dirname, '..', 'src'));
