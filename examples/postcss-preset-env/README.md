# `postcss-preset-env` example

Usage example with differential stylesheet loading.

1) 🦔 Declare environments in `.browserslistrc` config like this:

```
defaults
ios >= 8
ie >= 9

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
            }, {
                test: /\.css$/,
                use:  [
                    MiniCssExtractPlugin.loader,
                    {
                        loader:  'css-loader',
                        options: { importLoaders: 1 }
                    }, {
                        loader:  'postcss-loader',
                        options: {
                            ident:   'postcss',
                            plugins: () => [
                                postcssPresetEnv({
                                    preserve: false,
                                    stage:    0
                                })
                            ]
                        }
                    }
                ]
            }]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: '[name].[hash].css'
            }),
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
    const browsers = getBrowserslistQueries({ env });
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
                            targets: browsers
                        }]
                    ],
                    plugins:        [/* ... */]
                }
            }, {
                test: /\.css$/,
                use:  [
                    /* ... */
                    {
                        loader:  'postcss-loader',
                        options: {
                            ident:   'postcss',
                            plugins: () => [
                                postcssPresetEnv({
                                    /* ... */
                                    browsers
                                })
                            ]
                        }
                    }
                ]
            }]
        },
        plugins: [
            new MiniCssExtractPlugin(/* ... */),
            new HtmlWebpackPlugin(/* ... */),
            new BdslWebpackPlugin({
                withStylesheets:        true,
                unsafeUseDocumentWrite: true, // to load styles synchronously
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

4) 🎉 Done! Now `index.html` will contain differential script and stylesheet loading:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Example</title>
        <script>function dsl(a,s){dslf+='<script src="'+s+'" '+a+'><\/script>';}function dstl(a,s){dslf+='<link rel="stylesheet" href="'+s+'" '+a+'>';}var dslf='',dslu=navigator.userAgent,dsla=["",""];if(/((CPU[ +]OS|iPhone[ +]OS|CPU[ +]iPhone|CPU IPhone OS)[ +]+(13[_\.]0|13[_\.]([1-9]|\d{2,})|(1[4-9]|[2-9]\d|\d{3,})[_\.]\d+)(?:[_\.]\d+)?)|(SamsungBrowser\/(9\.2|9\.([3-9]|\d{2,})|([1-9]\d|\d{3,})\.\d+|10\.1|10\.([2-9]|\d{2,})|(1[1-9]|[2-9]\d|\d{3,})\.\d+))|(Edge\/(79|([8-9]\d|\d{3,}))(?:\.\d+)?)|(HeadlessChrome((?:\/79\.\d+\.\d+)?|(?:\/([8-9]\d|\d{3,})\.\d+\.\d+)?))|((Chromium|Chrome)\/(79|([8-9]\d|\d{3,}))\.\d+(?:\.\d+)?)|(Version\/(13|(1[4-9]|[2-9]\d|\d{3,}))\.\d+(?:\.\d+)?.*Safari\/)|(Firefox\/(68|(69|[7-9]\d|\d{3,})|72|(7[3-9]|[8-9]\d|\d{3,}))\.\d+\.\d+)|(Firefox\/(68|(69|[7-9]\d|\d{3,})|72|(7[3-9]|[8-9]\d|\d{3,}))\.\d+(pre|[ab]\d+[a-z]*)?)/.test(dslu))dstl(dsla[0],"/main.ce1cdd3f83afc4a45226.css"),dsl(dsla[1],"/index.modern.js")
else if(/((CPU[ +]OS|iPhone[ +]OS|CPU[ +]iPhone|CPU IPhone OS)[ +]+(11[_\.]3|11[_\.]([4-9]|\d{2,})|(1[2-9]|[2-9]\d|\d{3,})[_\.]\d+|12[_\.]0|12[_\.]([1-9]|\d{2,})|12[_\.]4|12[_\.]([5-9]|\d{2,})|(1[3-9]|[2-9]\d|\d{3,})[_\.]\d+)(?:[_\.]\d+)?)|(SamsungBrowser\/(7\.2|7\.([3-9]|\d{2,})|7\.4|7\.([5-9]|\d{2,})|([8-9]|\d{2,})\.\d+|8\.2|8\.([3-9]|\d{2,})|(9|\d{2,})\.\d+))|(Edge\/(17|(1[8-9]|[2-9]\d|\d{3,}))(?:\.\d+)?)|(HeadlessChrome((?:\/66\.\d+\.\d+)?|(?:\/(6[7-9]|[7-9]\d|\d{3,})\.\d+\.\d+)?))|((Chromium|Chrome)\/(66|(6[7-9]|[7-9]\d|\d{3,}))\.\d+(?:\.\d+)?([\d.]+$|.*Safari\/(?![\d.]+ Edge\/[\d.]+$)))|(Version\/(11\.1|11\.([2-9]|\d{2,})|(1[2-9]|[2-9]\d|\d{3,})\.\d+|12\.0|12\.([1-9]|\d{2,})|(1[3-9]|[2-9]\d|\d{3,})\.\d+)(?:\.\d+)?.*Safari\/)|(Firefox\/(59|([6-9]\d|\d{3,}))\.\d+\.\d+)|(Firefox\/(59|([6-9]\d|\d{3,}))\.\d+(pre|[ab]\d+[a-z]*)?)/.test(dslu))dstl(dsla[0],"/main.4791fe4c3dbd2793d6f8.css"),dsl(dsla[1],"/index.actual.js")
else dstl(dsla[0],"/main.7390cfa9f26cf9b2122d.css"),dsl(dsla[1],"/index.old.js");document.write(dslf)</script>
    </head>
    <body></body>
</html>
```
