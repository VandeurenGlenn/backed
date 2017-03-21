'use strict';
import base from './base.js';
import fireEvent from './internals/fire-event.js';
import toJsProp from './internals/to-js-prop.js';
import loadScript from './internals/load-script.js';
import PubSubLoader from './internals/pub-sub-loader.js';
const supportsCustomElementsV1 = 'customElements' in window;
const supportsCustomElementsV0 = 'registerElement' in document;

const isWindow = () => {
  try {
    return window;
  } catch(e) {
    return false;
  }
};

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

  // Setup properties & observers
  if (isWindow()) {
    if (supportsCustomElementsV1) {
      klass = class extends _class {
        constructor() {
          super();
          if (this.created) this.created();
          this._created();
        }
        connectedCallback() {
          if (this.connected) this.connected();
        }
        disconnectedCallback() {
          if (this.disconnected) this.disconnected();
        }
        _created() {
          PubSubLoader(isWindow());
          this.fireEvent = fireEvent.bind(this);
          this.toJsProp = toJsProp.bind(this);
          this.loadScript = loadScript.bind(this);

          base.handleProperties(this, _class.properties);
          base.handleObservers(this, _class.observers, _class.globalObservers);

          // notify everything is ready
          base.ready(this);
        }
      }
      customElements.define(name, klass);
    } else if (supportsCustomElementsV0) {
      klass = document.registerElement(name, class extends _class {
        createdCallback() {
          if (this.created) this.created();
          this._created();
        }
        attachedCallback() {
          if (this.connected) this.connected();
        }
        detachedCallback() {
          if (this.disconnected) this.disconnected();
        }
        _created() {
          PubSubLoader(isWindow());
          this.fireEvent = fireEvent.bind(this);
          this.toJsProp = toJsProp.bind(this);
          this.loadScript = loadScript.bind(this);

          base.handleProperties(this, _class.properties);
          base.handleObservers(this, _class.observers, _class.globalObservers);

          // notify everything is ready
          base.ready(this);
        }
        attachShadow() {
          // TODO: feature detect shadowDOM for V1
          return this.createShadowRoot();
        }
      })
    } else {
      console.warn('classes::unsupported');
    }
  } else {
    // TODO: handle Commonjs (properties, observers, etc ...)
    klass = _class;
  }
  return klass;
};
