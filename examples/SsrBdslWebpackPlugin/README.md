# `SsrBdslWebpackPlugin` example

`SsrBdslWebpackPlugin` usage example.

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

3) 🦄 Add `SsrBdslWebpackPlugin`:

```js
const {
    SsrBdslWebpackPlugin,
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
            new SsrBdslWebpackPlugin({
                replaceTagsWithPlaceholder: true,
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

4) 🐾 Output `index.html` will contain placeholder:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Example</title>
        <ssr-placeholder></ssr-placeholder>
    </head>
    <body></body>
</html>
```

5) 🦄 Now you able to make simple server with differential serving:

```js
/* ... */
import {
    SSRAssetsMatcher
} from 'bdsl-webpack-plugin';
/* ... */
const templateAccess = fs.readFile(path.join(STATIC, 'index.html'), 'utf8');
const assetsMatcher = new SSRAssetsMatcher({
    assetsFile: path.join(STATIC, 'ssr-bdsl-assets.json')
});

app.get('/', async (request, response) => {

    const userAgent = request.get('User-Agent');
    const template = await templateAccess;
    const assets = assetsMatcher.match(userAgent);
    const index = template.replace('<ssr-placeholder></ssr-placeholder>', assets.toHtml());

    console.log(userAgent, 'is', assets.env);

    response.send(index);
});
/* ... */
```
