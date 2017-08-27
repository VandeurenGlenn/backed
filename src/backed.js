'use strict';
import base from './base.js';
import renderStatus from './internals/render-status.js';
import { html } from './../node_modules/lit-html/lit-html.js';

const ____isWindow____ = () => {
  try {
    return window;
  } catch(e) {
    return false;
  }
};

const ____hasWindow____ = ____isWindow____();
if (____hasWindow____) {
  window['RenderStatus'] = window['RenderStatus'] || renderStatus;
  window.html = window.html || html;
} else {
  exports['RenderStatus'] = exports['RenderStatus'] || renderStatus;
  exports.html = exports.html || html;
}
/**
 *
 * @module backed
 * @param {class} _class
 */
export default _class => {
  const upperToHyphen = string => {
    return string.replace(/([A-Z])/g, "-$1").toLowerCase().replace('-', '');
  };

  let klass;

  // get the tagName or try to make one with class.name
  let name = _class.is || upperToHyphen(_class.name);
  let hasRenderer = false;
  // Setup properties & observers
  if (____hasWindow____) {
    const observedAttributes = [];
    for (const property of Object.entries(_class.properties)) {
      const {reflect, render} = property[1]
      if (reflect) {
        observedAttributes.push(property[0]);
      }
      if (render) {
        hasRenderer = true
      }
    }
    klass = class extends _class {
      static get observedAttributes() {
        return observedAttributes;
      }
      constructor() {
        super();
        if (hasRenderer && !this.shadowRoot) {
          this.attachShadow({mode: 'open'});
        }
        base.constructorCallback(this, _class, ____hasWindow____);
      }
      connectedCallback() {
        base.connectedCallback(this, _class);
      }
      disconnectedCallback() {
        if (this.disconnected) this.disconnected();
      }
      attributeChangedCallback(name, oldValue, newValue) {
        this[name] = newValue;
      }
    }
    if (base.shouldRegister(name, klass)) {
      customElements.define(name, klass);
    };
    return window[_class.name] = klass;
  } else {
    // TODO: add commonjs support
    // return exports[_class.name]
  }
};

window.dispatchEvent(new CustomEvent('backed-ready'));
