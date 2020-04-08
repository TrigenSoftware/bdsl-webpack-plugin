# `document-write` example

Usage example with enabled `unsafeUseDocumentWrite` option. That option switches plugin from using of `appendChild()` to `document.write()`. This variant supports `defer` scripts, [but some browsers can restrict `document.write()` calls](https://developers.google.com/web/updates/2016/08/removing-document-write).

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

3) 🦄 Add `bdsl-webpack-plugin` with enabled `unsafeUseDocumentWrite` option:

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
            new BdslWebpackPlugin({
                unsafeUseDocumentWrite: true,
                env
            })
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
        <script>function dsl(a,s){dslf+='<script src="'+s+'" '+a+'><\/script>';}var dslf='',dslu=navigator.userAgent,dsla=["defer"];if(/((CPU[ +]OS|iPhone[ +]OS|CPU[ +]iPhone|CPU IPhone OS)[ +]+(13[_\.]0|13[_\.]([1-9]|\d{2,})|(1[4-9]|[2-9]\d|\d{3,})[_\.]\d+)(?:[_\.]\d+)?)|(SamsungBrowser\/(9\.2|9\.([3-9]|\d{2,})|([1-9]\d|\d{3,})\.\d+|10\.1|10\.([2-9]|\d{2,})|(1[1-9]|[2-9]\d|\d{3,})\.\d+))|(Edge\/(79|([8-9]\d|\d{3,}))(?:\.\d+)?)|(HeadlessChrome((?:\/79\.\d+\.\d+)?|(?:\/([8-9]\d|\d{3,})\.\d+\.\d+)?))|((Chromium|Chrome)\/(79|([8-9]\d|\d{3,}))\.\d+(?:\.\d+)?)|(Version\/(13|(1[4-9]|[2-9]\d|\d{3,}))\.\d+(?:\.\d+)?.*Safari\/)|(Firefox\/(68|(69|[7-9]\d|\d{3,})|71|(7[2-9]|[8-9]\d|\d{3,}))\.\d+\.\d+)|(Firefox\/(68|(69|[7-9]\d|\d{3,})|71|(7[2-9]|[8-9]\d|\d{3,}))\.\d+(pre|[ab]\d+[a-z]*)?)/.test(dslu))dsl(dsla[0],"/index.modern.js")
else if(/((CPU[ +]OS|iPhone[ +]OS|CPU[ +]iPhone|CPU IPhone OS)[ +]+(11[_\.]3|11[_\.]([4-9]|\d{2,})|(1[2-9]|[2-9]\d|\d{3,})[_\.]\d+|12[_\.]0|12[_\.]([1-9]|\d{2,})|12[_\.]4|12[_\.]([5-9]|\d{2,})|(1[3-9]|[2-9]\d|\d{3,})[_\.]\d+)(?:[_\.]\d+)?)|(SamsungBrowser\/(7\.2|7\.([3-9]|\d{2,})|7\.4|7\.([5-9]|\d{2,})|([8-9]|\d{2,})\.\d+|8\.2|8\.([3-9]|\d{2,})|(9|\d{2,})\.\d+))|(Edge\/(17|(1[8-9]|[2-9]\d|\d{3,}))(?:\.\d+)?)|(HeadlessChrome((?:\/65\.\d+\.\d+)?|(?:\/(6[6-9]|[7-9]\d|\d{3,})\.\d+\.\d+)?))|((Chromium|Chrome)\/(65|(6[6-9]|[7-9]\d|\d{3,}))\.\d+(?:\.\d+)?([\d.]+$|.*Safari\/(?![\d.]+ Edge\/[\d.]+$)))|(Version\/(11\.1|11\.([2-9]|\d{2,})|(1[2-9]|[2-9]\d|\d{3,})\.\d+|12\.0|12\.([1-9]|\d{2,})|(1[3-9]|[2-9]\d|\d{3,})\.\d+)(?:\.\d+)?.*Safari\/)|(Firefox\/(59|([6-9]\d|\d{3,}))\.\d+\.\d+)|(Firefox\/(59|([6-9]\d|\d{3,}))\.\d+(pre|[ab]\d+[a-z]*)?)/.test(dslu))dsl(dsla[0],"/index.actual.js")
else dsl(dsla[0],"/index.legacy.js");document.write(dslf)</script>
    </head>
    <body></body>
</html>
```
