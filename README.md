# backed [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Small web framework for quick app & component development

## Features
- class development without the worry of constructors and calling super
- internal/scoped & global property observers, checkout [![using observers]][using-observers]
- updates property values to attributes & the otherway around, checkout [![using reflect]][using-reflect]
- templating using [![lit-html]][lit-html], checkout [![using render]][using-render]

## Installation

```sh
$ bower install --save backed
```

```sh
$ npm install --save backed
```

## Usage

### Basic usage
```js
Backed(class extends HTMLElement {
  ready() {
    // ready to go ...
  }
});
```

### Using observers

```js
Backed(class extends HTMLElement {
  static get properties() {
    return {
      name: {
        observer: 'change'
      }
    }
  }
  ready() {
    // ready to go ...
  }
  change(change) {
    console.log(change);
  }
});
```

### Using reflect

```js
Backed(class extends HTMLElement {
  static get properties() {
    return {
      name: {
        reflect: true
      }
    }
  }
  ready() {
    // ready to go ...
  }
});
```

### Using render

```js
Backed(class extends HTMLElement {
  static get properties() {
    return {
      name: {
        render: true,
        value: 'name should go here'
      },      
      lastname: {
        render: true
        value: 'lastname should go here'
      }
    }
  }
  render() {
    html`
      <style></style>
      <h1>${this.name}</h1>
      <h2>${this.lastname}</h2>
    `
  }
});
```
#### or

warning: watch out when using multiple renderers, when doing this the element will have the templateResult of the last render
```js
Backed(class extends HTMLElement {
  static get properties() {
    return {
      name: {
        render: 'renderName'
      }
    }
  }
  renderName() {
    html`
      <style></style>
      <h1>${this.name}</h1>
    `
  }
});
```

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
[using-observers]: README.md#using-observers
[using-reflect]: README.md#using-reflect
[using-render]: README.md#using-render
[npm-image]: https://badge.fury.io/js/backed.svg
[npm-url]: https://npmjs.org/package/backed
[travis-image]: https://travis-ci.org/basicelements/backed.svg?branch=master
[travis-url]: https://travis-ci.org/basicelements/backed
[daviddm-image]: https://david-dm.org/basicelements/backed.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/basicelements/backed
[coveralls-image]: https://coveralls.io/repos/basicelements/backed/badge.svg
[coveralls-url]: https://coveralls.io/r/basicelements/backed
