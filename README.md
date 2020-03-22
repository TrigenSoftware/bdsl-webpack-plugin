# bdsl-webpack-plugin

[![NPM version][npm]][npm-url]
[![Node version][node]][node-url]
[![Dependencies status][deps]][deps-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]
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

[coverage]: https://img.shields.io/coveralls/TrigenSoftware/bdsl-webpack-plugin.svg
[coverage-url]: https://coveralls.io/r/TrigenSoftware/bdsl-webpack-plugin

[dependabot]: https://api.dependabot.com/badges/status?host=github&repo=TrigenSoftware/bdsl-webpack-plugin
[dependabot-url]: https://dependabot.com/

A webpack plugin that automates generation of the differential script loading with [browserslist](https://github.com/browserslist/browserslist) and [browserslist-useragent-regexp](https://github.com/browserslist/browserslist-useragent-regexp).

1) 🦔 Declare environments in `.browserslistrc` config like this:

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
    undefined // to use default .browserslistrc queries
].map(createWebpackConfig);
```

4) 🎉 Done! Now `index.html` will contain differential script loading:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Example</title>
        <script>function dsl(a,s,c,l,i){c=dsld.createElement('script');c.async=a[0];c.src=s;l=a.length;for(i=1;i<l;i++)c.setAttribute(a[i][0],a[i][1]);dslf.appendChild(c)}var dsld=document,dslf=dsld.createDocumentFragment(),dslu=navigator.userAgent,dsla=[[]];if(/((CPU[ +]OS|iPhone[ +]OS|CPU[ +]iPhone|CPU IPhone OS)[ +]+(13[_\.]0|13[_\.]([1-9]|\d{2,})|(1[4-9]|[2-9]\d|\d{3,})[_\.]\d+)(?:[_\.]\d+)?)|(SamsungBrowser\/(9\.2|9\.([3-9]|\d{2,})|([1-9]\d|\d{3,})\.\d+|10\.1|10\.([2-9]|\d{2,})|(1[1-9]|[2-9]\d|\d{3,})\.\d+))|(Edge\/(79|([8-9]\d|\d{3,}))(?:\.\d+)?)|(HeadlessChrome((?:\/79\.\d+\.\d+)?|(?:\/([8-9]\d|\d{3,})\.\d+\.\d+)?))|((Chromium|Chrome)\/(79|([8-9]\d|\d{3,}))\.\d+(?:\.\d+)?)|(Version\/(13|(1[4-9]|[2-9]\d|\d{3,}))\.\d+(?:\.\d+)?.*Safari\/)|(Firefox\/(68|(69|[7-9]\d|\d{3,})|71|(7[2-9]|[8-9]\d|\d{3,}))\.\d+\.\d+)|(Firefox\/(68|(69|[7-9]\d|\d{3,})|71|(7[2-9]|[8-9]\d|\d{3,}))\.\d+(pre|[ab]\d+[a-z]*)?)/.test(dslu))dsl(dsla[0],"/index.modern.js")
else if(/((CPU[ +]OS|iPhone[ +]OS|CPU[ +]iPhone|CPU IPhone OS)[ +]+(11[_\.]3|11[_\.]([4-9]|\d{2,})|(1[2-9]|[2-9]\d|\d{3,})[_\.]\d+|12[_\.]0|12[_\.]([1-9]|\d{2,})|12[_\.]4|12[_\.]([5-9]|\d{2,})|(1[3-9]|[2-9]\d|\d{3,})[_\.]\d+)(?:[_\.]\d+)?)|(SamsungBrowser\/(7\.2|7\.([3-9]|\d{2,})|7\.4|7\.([5-9]|\d{2,})|([8-9]|\d{2,})\.\d+|8\.2|8\.([3-9]|\d{2,})|(9|\d{2,})\.\d+))|(Edge\/(17|(1[8-9]|[2-9]\d|\d{3,}))(?:\.\d+)?)|(HeadlessChrome((?:\/65\.\d+\.\d+)?|(?:\/(6[6-9]|[7-9]\d|\d{3,})\.\d+\.\d+)?))|((Chromium|Chrome)\/(65|(6[6-9]|[7-9]\d|\d{3,}))\.\d+(?:\.\d+)?([\d.]+$|.*Safari\/(?![\d.]+ Edge\/[\d.]+$)))|(Version\/(11\.1|11\.([2-9]|\d{2,})|(1[2-9]|[2-9]\d|\d{3,})\.\d+|12\.0|12\.([1-9]|\d{2,})|(1[3-9]|[2-9]\d|\d{3,})\.\d+)(?:\.\d+)?.*Safari\/)|(Firefox\/(59|([6-9]\d|\d{3,}))\.\d+\.\d+)|(Firefox\/(59|([6-9]\d|\d{3,}))\.\d+(pre|[ab]\d+[a-z]*)?)/.test(dslu))dsl(dsla[0],"/index.actual.js")
else dsl(dsla[0],"/index.old.js");dsld.all[1].appendChild(dslf)</script>
    </head>
    <body></body>
</html>
```

[Here you can see complete `webpack.config.js` example.](https://github.com/TrigenSoftware/bdsl-webpack-plugin/blob/master/examples/basic/webpack.config.js)

## Install

```bash
npm i -D bdsl-webpack-plugin
# or
yarn add -D bdsl-webpack-plugin
```

## ⚠️ Before you start ⚠️

1) `bdsl-webpack-plugin` captures scripts only from `<head>` section, so with `html-webpack-plugin` you should use `inject: 'head'` option;
2) By default scripts are loaded [asynchronously](https://javascript.info/script-async-defer#dynamic-scripts) and executed in "as they defined" order. To execute script in "load-first" order you should add [`async`](https://javascript.info/script-async-defer#async) attribute to `<script>` tag. For that you can use [`script-ext-html-webpack-plugin`](https://github.com/numical/script-ext-html-webpack-plugin);
3) `defer` scripts are not supported, so you can use libraries like [`when-dom-ready`](https://www.npmjs.com/package/when-dom-ready) to bootstrap code when `DOM` ready;
4) Webpack configs must be in modern to old browser order, e.g. `['modern', 'actual', 'old']`;
5) `bdsl-webpack-plugin` also defines `process.env.BDSL_ENV` variable with bundle's environment.

## Why?

There is a differential script loading with [module/nomodule trick](https://dev.to/thejohnstew/differential-serving-3dkf), for this you can use [`webpack-module-nomodule-plugin`](https://www.npmjs.com/package/webpack-module-nomodule-plugin). But browsers that support `type=module` already have new JS-features with different level of support. For example: [optional chaining operator](https://caniuse.com/#feat=mdn-javascript_operators_optional_chaining) (for comparison [browsers with `type=module` support](https://caniuse.com/#feat=es6-module)).

## Plugin options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| isModule | `boolean` | — | Use `type=module` support check instead of RegExp. Should be used only on certain build. |
| browsers | `string \| string[]` | — | Manually provide a browserslist query (or an array of queries). It overrides the browserslist configuration specified in your project. |
| env | `string` | — | When multiple browserslist [environments](https://github.com/ai/browserslist#environments) are specified, pick the config belonging to this environment. |
| ignorePatch | `boolean` | `true` | Ignore the difference in patch browser numbers. |
| ignoreMinor | `boolean` | `false` | Ignore the difference in minor browser versions. |
| allowHigherVersions | `boolean` | `true` | For all browsers in the browserslist query, return a match if the useragent version is equal to or higher than the one specified in browserslist. |
| allowZeroSubverions | `boolean` | `true` | Ignore match of patch or patch and minor, if they are 0. |
| withStylesheets | `boolean` | `false` | Enable differential stylesheets loading. |
| unsafeUseDocumentWrite | `boolean` | `false` | Use `document.write()` to inject `<script>`. This variant supports `defer` scripts, [but some browsers can restrict `document.write()` calls](https://developers.google.com/web/updates/2016/08/removing-document-write). |

## Examples

- [Basic](https://github.com/TrigenSoftware/bdsl-webpack-plugin/blob/master/examples/basic/)
- [`isModule` option with `@babel/preset-modules`](https://github.com/TrigenSoftware/bdsl-webpack-plugin/blob/master/examples/esm/)
- [Differential stylesheet loading](https://github.com/TrigenSoftware/bdsl-webpack-plugin/blob/master/examples/postcss-preset-env/)
- [Transpile dependencies](https://github.com/TrigenSoftware/bdsl-webpack-plugin/blob/master/examples/transpile-dependencies/)
- [`unsafeUseDocumentWrite` option](https://github.com/TrigenSoftware/bdsl-webpack-plugin/blob/master/examples/document-write/)
- [JS API with `@loadable/server`](https://github.com/TrigenSoftware/DevFest-Siberia/blob/5f69fd81361896a6ca77256cb04dbea1e6842b30/src/App/render.tsx#L159)

## Metrics

You can get speed metrics from any site using devtool from this repo.

1) Clone repo:

```bash
git clone git@github.com:TrigenSoftware/bdsl-webpack-plugin.git
```

2) Install dependencies:

```bash
yarn
```

3) Now you can run script:

```bash
yarn measure \
"https://nodsl.site.com/" \
"https://site.com/"
```

<details>
    <summary>Output example</summary>

```bash
https://nodsl.site.com/

Average time: 1s 303ms
Fastest time: 1s 203ms
Slowest time: 2s 432ms
Encoded size: 292 kB
Decoded size: 1.08 MB

https://site.com/

Average time: 1s 274ms
Fastest time: 1s 140ms
Slowest time: 2s 284ms
Encoded size: 218 kB
Decoded size: 806 kB
```
</details>


<details>
    <summary>Parameters</summary>

Environment variables:

```
MEASURE_TIMES - number of site measurements, 10 by default
```

Options:

```
--good3g - enable "Good 3G" network preset
--regular4g - enable "Regular 4G" network preset
--cache - enable resource caching
```
</details>
