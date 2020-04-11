# JS API

## getBrowserslistQueries(options)

Get queries from Browserslist config.

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| options | `object` | `{}` | [Browserslist options](https://github.com/browserslist/browserslist#js-api). |

Returns `object`.

## getBrowserslistEnvList(options)

Get Browserslist config's environments, ignoring `defaults` env.

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| options | `object` | — | [Browserslist options](https://github.com/browserslist/browserslist#js-api). |

Returns `string[]`.

## getEnvName(options)

Get environment name from options.

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| options | `object` | `{}` | `bdsl-webpack-plugin` options. |

Returns `string`.

## pasteBrowserslistEnv(template, browserslistEnv)

Paste Browserslist environment name into filename template.

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| template | `string` | — | Filename template with `[env]` placeholder. |
| browserslistEnv | `string` | — | Environment name to paste. |

Returns `string`.

## class BdslWebpackPlugin

Read options [here](https://github.com/TrigenSoftware/bdsl-webpack-plugin#plugin-options).

## class SsrBdslWebpackPlugin

Read options [here](https://github.com/TrigenSoftware/bdsl-webpack-plugin/tree/master/examples/SsrBdslWebpackPlugin#plugin-options).

## class BdslBuilder

Browserslist Differential Script Loading builder.

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| options | `object` | `{}` | Builder and browserslist-useragent-regexp common options. |
| options.ignorePatch | `boolean` | `true` | Ignore the difference in patch browser numbers. |
| options.ignoreMinor | `boolean` | `false` | Ignore the difference in minor browser versions. |
| options.allowHigherVersions | `boolean` | `true` | For all browsers in the browserslist query, return a match if the useragent version is equal to or higher than the one specified in browserslist. |
| options.allowZeroSubverions | `boolean` | `true` | Ignore match of patch or patch and minor, if they are 0. |
| options.unsafeUseDocumentWrite | `boolean` | `false` | Use `document.write()` to inject `<script>`. This variant supports `defer` scripts, [but some browsers can restrict `document.write()` calls](https://developers.google.com/web/updates/2016/08/removing-document-write). |

### isBuildable()

Check builder has enough count of environments.

Returns `boolean`.

### isFilled()

Check builder has elements for every environment.

Returns `boolean`.

### getDefaultEnvElements()

Get HTML elements for default env.

Returns `HTMLElementObject[]`.

### addEnv(options, elements)

Add environment.

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| options | `object` | `{}` | Builder and browserslist-useragent-regexp options. |
| options.isModule | `boolean` | — | Use `type=module` support check instead of RegExp. Should be used only on certain build. |
| options.browsers | `string \| string[]` | — | Manually provide a browserslist query (or an array of queries). It overrides the browserslist configuration specified in your project. |
| options.env | `string` | — | When multiple browserslist [environments](https://github.com/ai/browserslist#environments) are specified, pick the config belonging to this environment. |
| options.ignorePatch | `boolean` | `true` | Ignore the difference in patch browser numbers. |
| options.ignoreMinor | `boolean` | `false` | Ignore the difference in minor browser versions. |
| options.allowHigherVersions | `boolean` | `true` | For all browsers in the browserslist query, return a match if the useragent version is equal to or higher than the one specified in browserslist. |
| options.allowZeroSubverions | `boolean` | `true` | Ignore match of patch or patch and minor, if they are 0. |
| elements | `(HTMLElementObject \| JSXElementObject)[]` | — | script/style elements. |

Returns `string` - environment name.

### setEnvElements(optionsOrEnv, elements)

Set environment elements.

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| optionsOrEnv | `string \| object` | — | Filename template with `[env]` placeholder. |
| elements | `(HTMLElementObject \| JSXElementObject)[]` | — | Environment name to paste. |

Returns `string` - environment name.

### build(options)

Build DSL script.

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| options | `object` | `{}` | Build options. |
| options.unsafeUseDocumentWrite | `boolean` | `false` | Use `document.write()` to inject `<script>`. This variant supports `defer` scripts, [but some browsers can restrict `document.write()` calls](https://developers.google.com/web/updates/2016/08/removing-document-write). |
| options.debug | `boolean` | `process.env.NODE_ENV !== 'production'` | Print debug info. |

Returns `string`.

## class SSRAssetsMatcher

Assets to browser matcher.

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| options | `object` | — | Options to create matcher. |
| options.assets | `object` | — | Assets collection object. |
| options.assetsFile | `string` | — | Path to JSON file with assets collection. |
| options.fs | `object` | `require('fs')` | NodeJS's FS compatible module. |

### match(userAgent)

Get assets for browser by useragent.

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| userAgent | `string` | — | UserAgent to match assets. |

Returns [`SSRAssetsContainer`](#class-ssrassetscontainer).

## class SSRAssetsContainer

SSR Assets Container.

### getObjects()

Get HTML-elements objects.

Returns `HTMLElementObject[]`.

### getTags()

Get HTML-elements tags strings.

Returns `string[]`.

### toHtml(beautify)

Get HTML-elements string from container.

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| beautify | `boolean` | `false` | Beautify output. |

Returns `string`.

### toString()

Get HTML-elements string from container.

Returns `string`.
