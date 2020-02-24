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

A webpack plugin that automates generation of the differential script loading with [browserslist](https://github.com/browserslist/browserslist) and [browserslist-useragent-regexp](https://github.com/browserslist/browserslist-useragent-regexp).

# Usage

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

3) 🦄 Add `bdsl-webpack-plugin` to your code:

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
        <script>function dsl(a,s,c,l,i){c=document.createElement('script');l=a.length;c.async=a[0];c.setAttribute('src',s);for(i=1;i<l;i++)c.setAttribute(a[i][0], a[i][1]);dslh.appendChild(c)}var dslh=document.getElementsByTagName('head')[0],dslu=navigator.userAgent,dsla=[[]];if(/((CPU[ +]OS|iPhone[ +]OS|CPU[ +]iPhone|CPU IPhone OS)[ +]+(13[_\.]0|13[_\.]([1-9]|\d{2,})|(1[4-9]|[2-9]\d|\d{3,})[_\.]\d+)(?:[_\.]\d+)?)|(SamsungBrowser\/(9\.2|9\.([3-9]|\d{2,})|([1-9]\d|\d{3,})\.\d+|10\.1|10\.([2-9]|\d{2,})|(1[1-9]|[2-9]\d|\d{3,})\.\d+))|(Edge\/(79|([8-9]\d|\d{3,}))(?:\.\d+)?)|(HeadlessChrome((?:\/79\.\d+\.\d+)?|(?:\/([8-9]\d|\d{3,})\.\d+\.\d+)?))|((Chromium|Chrome)\/(79|([8-9]\d|\d{3,}))\.\d+(?:\.\d+)?)|(Version\/(13|(1[4-9]|[2-9]\d|\d{3,}))\.\d+(?:\.\d+)?.*Safari\/)|(Firefox\/(68|(69|[7-9]\d|\d{3,})|71|(7[2-9]|[8-9]\d|\d{3,}))\.\d+\.\d+)|(Firefox\/(68|(69|[7-9]\d|\d{3,})|71|(7[2-9]|[8-9]\d|\d{3,}))\.\d+(pre|[ab]\d+[a-z]*)?)/.test(dslu))dsl(dsla[0],"/index.modern.js")
else if(/((CPU[ +]OS|iPhone[ +]OS|CPU[ +]iPhone|CPU IPhone OS)[ +]+(11[_\.]3|11[_\.]([4-9]|\d{2,})|(1[2-9]|[2-9]\d|\d{3,})[_\.]\d+|12[_\.]0|12[_\.]([1-9]|\d{2,})|12[_\.]4|12[_\.]([5-9]|\d{2,})|(1[3-9]|[2-9]\d|\d{3,})[_\.]\d+)(?:[_\.]\d+)?)|(SamsungBrowser\/(7\.2|7\.([3-9]|\d{2,})|7\.4|7\.([5-9]|\d{2,})|([8-9]|\d{2,})\.\d+|8\.2|8\.([3-9]|\d{2,})|(9|\d{2,})\.\d+))|(Edge\/(17|(1[8-9]|[2-9]\d|\d{3,}))(?:\.\d+)?)|(HeadlessChrome((?:\/65\.\d+\.\d+)?|(?:\/(6[6-9]|[7-9]\d|\d{3,})\.\d+\.\d+)?))|((Chromium|Chrome)\/(65|(6[6-9]|[7-9]\d|\d{3,}))\.\d+(?:\.\d+)?([\d.]+$|.*Safari\/(?![\d.]+ Edge\/[\d.]+$)))|(Version\/(11\.1|11\.([2-9]|\d{2,})|(1[2-9]|[2-9]\d|\d{3,})\.\d+|12\.0|12\.([1-9]|\d{2,})|(1[3-9]|[2-9]\d|\d{3,})\.\d+)(?:\.\d+)?.*Safari\/)|(Firefox\/(59|([6-9]\d|\d{3,}))\.\d+\.\d+)|(Firefox\/(59|([6-9]\d|\d{3,}))\.\d+(pre|[ab]\d+[a-z]*)?)/.test(dslu))dsl(dsla[0],"/index.actual.js")
else dsl(dsla[0],"/index.old.js")</script>
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
3) `defer` scripts are not supported, so you can use libraries like [when-dom-ready](https://www.npmjs.com/package/when-dom-ready) to bootstrap code when `DOM` ready;
4) Webpack configs must be in modern to old browser order, e.g. `['modern', 'actual', 'old']`;
5) `bdsl-webpack-plugin` also defines `process.env.BDSL_ENV` variable with bundle's environment.

## Why?

There is a differential script loading with [module/nomodule trick](https://dev.to/thejohnstew/differential-serving-3dkf), for this you can use [webpack-module-nomodule-plugin](https://www.npmjs.com/package/webpack-module-nomodule-plugin). But browsers that support `type=module` already have new JS-features with different level of support. For example: [optional chaining operator](https://caniuse.com/#feat=mdn-javascript_operators_optional_chaining) (for comparison [browsers with `type=module` support](https://caniuse.com/#feat=es6-module)).

## Plugin options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| browsers | `string \| string[]` | — | Manually provide a browserslist query (or an array of queries). It overrides the browserslist configuration specified in your project. |
| env | `string` | — | When multiple browserslist [environments](https://github.com/ai/browserslist#environments) are specified, pick the config belonging to this environment. |
| ignorePatch | `boolean` | `true` | Ignore the difference in patch browser numbers. |
| ignoreMinor | `boolean` | `false` | Ignore the difference in minor browser versions. |
| allowHigherVersions | `boolean` | `true` | For all browsers in the browserslist query, return a match if the useragent version is equal to or higher than the one specified in browserslist. |
| allowZeroSubverions | `boolean` | `true` | Ignore match of patch or patch and minor, if they are 0. |
