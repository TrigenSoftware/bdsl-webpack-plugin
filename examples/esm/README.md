# `esm` example

Usage example with `@babel/preset-modules`.

1) 🦔 Declare environments in `.browserslistrc` config like this:

```
defaults

[esm]
edge >= 16
firefox >= 60
chrome >= 61
safari >= 11
opera >= 48
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

3) 🦄 Add `bdsl-webpack-plugin` and `@babel/preset-modules`:

```js
const {
    BdslWebpackPlugin,
    getBrowserslistQueries,
    getBrowserslistEnvList
} = require('bdsl-webpack-plugin');

function createWebpackConfig(env) {
    const isEsm = env === 'esm';
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
                    presets:        isEsm ? [
                        '@babel/preset-modules'
                    ] : [
                        ['@babel/preset-env', {
                            /* ... */
                            targets: getBrowserslistQueries({ env })
                        }]
                    ],
                    plugins:        isEsm ? [] : [/* ... */]
                }
            }]
        },
        plugins: [
            new HtmlWebpackPlugin(/* ... */),
            new BdslWebpackPlugin({
                isModule: isEsm,
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
        <script>function dsl(a,s,c,l,i){c=dsld.createElement('script');c.async=a[0];c.src=s;l=a.length;for(i=1;i<l;i++)c.setAttribute(a[i][0],a[i][1]);dslf.appendChild(c)}var dsld=document,dslf=dsld.createDocumentFragment(),dslu=navigator.userAgent,dsla=[[]];if('noModule' in dsld.createElement('script'))dsl(dsla[0],"/index.esm.js")
else dsl(dsla[0],"/index.old.js");dsld.all[1].appendChild(dslf)</script>
    </head>
    <body></body>
</html>
```
