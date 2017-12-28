'use strict';
import base from './base.js';
// import renderStatus from './internals/render-status.js';
import { html } from './../../lit-html/lit-html.js';
import {shouldRegister, hyphenate} from './utils.js';

const ____isWindow____ = () => {
  try {
    return window;
  } catch(e) {
    return false;
  }
};

const ____hasWindow____ = ____isWindow____();
if (____hasWindow____) {
  // window['RenderStatus'] = window['RenderStatus'] || renderStatus;
  window.html = window.html || html;
} else {
  // exports['RenderStatus'] = exports['RenderStatus'] || renderStatus;
  exports.html = exports.html || html;
}
/**
 *
 * @module backed
 * @param {class} _class
 */
export default _class => {
  let klass;
  // get the tagName or try to make one with class.name
  let name = _class.is || hyphenate(_class.name);
  let hasRenderer = false;
  // Setup properties & observers
  const observedAttributes = [];
  klass = class extends _class {
    static get observedAttributes() {
      return Object.entries(_class.properties).map(entry => {if (entry[1].reflect) {return entry[0]} else return null});
    }
    constructor() {
      super();
      base.constructorCallback(this, _class);
    }
    connectedCallback() {
      base.connectedCallback(this, _class);
    }
    attributeChangedCallback(name, oldValue, newValue) {
      this[name] = newValue;
    }
  }
  if (shouldRegister(name, klass)) {
    customElements.define(name, klass);
  };
};
