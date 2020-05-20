# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!--

DO NOT TOUCH. SAVE IT ON TOP.

## [semver] - date
### Added
- ...

### Changed
- ...

### Fixed
- ...

### Removed
- ...

-->

## [1.5.0-beta] - 2020-05-21
### Changed
- Dependencies update.

## [1.4.0-beta] - 2020-04-12
### Added
- `SsrBdslWebpackPlugin` for differential serving implementation;
- JS API docs.

## [1.3.0-beta] - 2020-03-21
### Added
- `isModule` option: use `type=module` support check instead of RegExp;
- More tests.

### Changed
- `esm` example changed to show `isModule` option.

## [1.2.0-beta] - 2020-03-16
### Added
- `<noscript>` fallback for stylesheets;
- External JS API;
- More tests.

### Fixed
- `unsafeUseDocumentWrite` dsl rendering fix.

## [1.1.0-beta] - 2020-03-05
### Added
- Differential stylesheet loading by `withStylesheets` option;
- `unsafeUseDocumentWrite` option;
- Examples.

### Changed
- DocumentFragment is used for inserting elements.
