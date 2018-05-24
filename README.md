# backed [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Small web framework for quick app & component development

## Features
- class development without the worry of constructors and calling super
- internal/scoped & global property observers, checkout [using observers]
- updates property values to attributes & the otherway around, checkout [using reflect]
- templating using [lit-html], checkout [using render]

## Installation

```sh
$ yarn add backed
```

```sh
$ npm install --save backed
```

## Usage
### Importing
#### ES modules
Imports are found in the "src" folder
```js
import package from 'package/location/src/package.js';
```
#### iife
Imports are found in the package root folder
```html
<script src="package/location/package.js"></script>
```

### Basic usage
```js
Backed(class extends HTMLElement {
  ready() {
    // ready to go ...
  }
});
```

[examples](https://github.com/VandeurenGlenn/backed/examples.md)

## More info
- [wiki](https://github.com/VandeurenGlenn/backed/wiki)

## Roadmap
- [x] Support customElementsV1
- [ ] Support commonjs (node)
- [x] Add observer support
- [x] Add global observer support

## TODO

- [ ] Add strict property support (wip)
- [ ] Handle Commonjs (properties, observers, etc ...)
- [ ] Bind properties & attributes (use pubsub to notify changes)
- [x] Reflect properties & attributes
- [ ] Add demo's
- [ ] Add documentation

## License

CC-BY-NC-ND-4.0 © [Glenn Vandeuren]()
[lit-html]: https://www.npmjs.com/package/lit-html
[using observers]: README.md#using-observers
[using reflect]: README.md#using-reflect
[using render]: README.md#using-render
[npm-image]: https://badge.fury.io/js/backed.svg
[npm-url]: https://npmjs.org/package/backed
[travis-image]: https://travis-ci.org/basicelements/backed.svg?branch=master
[travis-url]: https://travis-ci.org/basicelements/backed
[daviddm-image]: https://david-dm.org/basicelements/backed.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/basicelements/backed
[coveralls-image]: https://coveralls.io/repos/basicelements/backed/badge.svg
[coveralls-url]: https://coveralls.io/r/basicelements/backed
