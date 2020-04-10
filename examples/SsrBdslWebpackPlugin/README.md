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

## Plugin options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| filename | `string` | `'ssr-bdsl-assets.json'` | Assets collection JSON file name. |
| browsers | `string \| string[]` | — | Manually provide a browserslist query (or an array of queries). It overrides the browserslist configuration specified in your project. |
| env | `string` | — | When multiple browserslist [environments](https://github.com/ai/browserslist#environments) are specified, pick the config belonging to this environment. |
| ignorePatch | `boolean` | `true` | Ignore the difference in patch browser numbers. |
| ignoreMinor | `boolean` | `false` | Ignore the difference in minor browser versions. |
| allowHigherVersions | `boolean` | `true` | For all browsers in the browserslist query, return a match if the useragent version is equal to or higher than the one specified in browserslist. |
| allowZeroSubverions | `boolean` | `true` | Ignore match of patch or patch and minor, if they are 0. |
| withStylesheets | `boolean` | `false` | Enable differential stylesheets loading. |
| replaceTagsWithPlaceholder | `boolean` | `false` | Replace script/link tags in HTML-file to `<ssr-placeholder></ssr-placeholder>`. |

## JS API

### class SSRAssetsMatcher

Assets to browser matcher.

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| options | `object` | — | Options to create matcher. |
| options.assets | `object` | — | Assets collection object. |
| options.assetsFile | `string` | — | Path to JSON file with assets collection. |
| options.fs | `object` | — | NodeJS's FS compatible module. |

#### match(userAgent)

Get assets for browser by useragent.

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| userAgent | `string` | — | UserAgent to match assets. |

Returns [`SSRAssetsContainer`](#class-ssrassetscontainer).

### class SSRAssetsContainer

SSR Assets Container.

#### getObjects()

Get HTML-elements objects.

Returns `HTMLElementObject[]`.

#### getTags()

Get HTML-elements tags strings.

Returns `string[]`.

#### toHtml(beautify)

Get HTML-elements string from container.

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| beautify | `boolean` | `false` | Beautify output. |

Returns `string`.

#### toString()

Get HTML-elements string from container.

Returns `string`.
