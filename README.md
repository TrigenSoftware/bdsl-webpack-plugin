# bdsl-webpack-plugin

[![NPM version][npm]][npm-url]
[![Node version][node]][node-url]
[![Dependencies status][deps]][deps-url]
[![Build status][build]][build-url]
[![Dependabot badge][dependabot]][dependabot-url]

[npm]: https://img.shields.io/npm/v/bdsl-webpack-plugin.svg
[npm-url]: https://npmjs.com/package/bdsl-webpack-plugin

[node]: https://img.shields.io/node/v/bdsl-webpack-plugin.svg
[node-url]: https://nodejs.org

[peer-deps]: https://david-dm.org/TrigenSoftware/bdsl-webpack-plugin/peer-status.svg
[peer-deps-url]: https://david-dm.org/TrigenSoftware/bdsl-webpack-plugin?type=peer

[deps]: https://david-dm.org/TrigenSoftware/bdsl-webpack-plugin.svg
[deps-url]: https://david-dm.org/TrigenSoftware/bdsl-webpack-plugin

[build]: http://img.shields.io/travis/com/TrigenSoftware/bdsl-webpack-plugin/master.svg
[build-url]: https://travis-ci.com/TrigenSoftware/bdsl-webpack-plugin

[dependabot]: https://api.dependabot.com/badges/status?host=github&repo=TrigenSoftware/bdsl-webpack-plugin
[dependabot-url]: https://dependabot.com/

A webpack plugin to automate the generation of differential script loading. It uses [browserslist](https://github.com/browserslist/browserslist) and [browserslist-useragent-regexp](https://github.com/browserslist/browserslist-useragent-regexp).

1) 🦔 Create `.browserslistrc` config with environments, for example like this:

```
defaults

[modern]
last 2 versions and last 1 year and not safari 12.1

[actual]
last 2 years and not last 2 versions
```

2) 📝 Create `webpack.config.js` for [multiple outputs](https://webpack.js.org/configuration/configuration-types/#exporting-multiple-configurations):

```js
function createWebpackConfig(env) {
    return {
        name:    env,
        /* ... */
        module:  {
            rules: [{
                test:    /\.js$/,
                exclude: /node_modules/,
                loader:  'babel-loader',
                options: {
                    cacheDirectory: true,
                    presets:        [
                        ['@babel/preset-env', {
                            modules:     false,
                            useBuiltIns: 'usage',
                            corejs:      3
                        }]
                    ],
                    plugins:        [/* ... */]
                }
            }]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: 'src/index.html',
                inject:   'head'
            })
        ]
    };
}
```

3) 🦄 Add `bdsl-webpack-plugin`:

```js
const {
    BdslWebpackPlugin,
    getBrowserslistQueries,
    getBrowserslistEnvList
} = require('bdsl-webpack-plugin');

function createWebpackConfig(env) {
    return {
        name:    env,
        /* ... */
        module:  {
            rules: [{
                test:    /\.js$/,
                exclude: /node_modules/,
                loader:  'babel-loader',
                options: {
                    cacheDirectory: true,
                    presets:        [
                        ['@babel/preset-env', {
                            /* ... */
                            targets: getBrowserslistQueries({ env })
                        }]
                    ],
                    plugins:        [/* ... */]
                }
            }]
        },
        plugins: [
            new HtmlWebpackPlugin(/* ... */),
            new BdslWebpackPlugin({ env })
        ]
    };
}

module.exports = [
    ...getBrowserslistEnvList(),
    undefined
].map(createWebpackConfig);
```

4) 🎉 Done! Now output `index.html` will contain differential script loading.

[Here you can see complete `webpack.config.js` example.](https://github.com/TrigenSoftware/bdsl-webpack-plugin/blob/master/example/webpack.config.js)

## Install

```bash
npm i -D bdsl-webpack-plugin
# or
yarn add -D bdsl-webpack-plugin
```

## ⚠️ You should know ⚠️

1) `bdsl-webpack-plugin` captures scripts only from `<head>` section, so with `html-webpack-plugin` you should use `inject: 'head'` setting;
2) By default scripts will loading [asynchronously](https://javascript.info/script-async-defer#dynamic-scripts). You can use [`script-ext-html-webpack-plugin`](https://github.com/numical/script-ext-html-webpack-plugin) to set all scripts to [`defer`](https://javascript.info/script-async-defer#defer);
3) Webpack configs must be in order from modern to old browsers, e.g. `['modern', 'actual', 'old']`;

## Why?

There is differential script loading with [module/nomodule trick](https://dev.to/thejohnstew/differential-serving-3dkf), for this you can use [webpack-module-nomodule-plugin](https://www.npmjs.com/package/webpack-module-nomodule-plugin). But browsers that support `type=module` already have new JS-features with different level of support. For example: [optional chaining operator](https://caniuse.com/#feat=mdn-javascript_operators_optional_chaining) (for comparison [browsers with `type=module` support](https://caniuse.com/#feat=es6-module)).

## Plugin options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| browsers | `string \| string[]` | — | Manually provide a browserslist query (or an array of queries). Specifying this overrides the browserslist configuration specified in your project. |
| env | `string` | — | When multiple browserslist [environments](https://github.com/ai/browserslist#environments) are specified, pick the config belonging to this environment. |
| ignorePatch | `boolean` | `true` | Ignore differences in patch browser numbers. |
| ignoreMinor | `boolean` | `false` | Ignore differences in minor browser versions. |
| allowHigherVersions | `boolean` | `true` | For all the browsers in the browserslist query, return a match if the useragent version is equal to or higher than the one specified in browserslist. |
| allowZeroSubverions | `boolean` | `true` | Ignore match of patch or patch and minor, if they are 0. |
