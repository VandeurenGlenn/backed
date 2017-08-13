'use strict';
import base from './base.js';
import renderStatus from './internals/render-status.js';
window['RenderStatus'] = renderStatus;

const ____CustomElementsV1____ = 'customElements' in window;
const ____ShadowDOMV1____ = !!HTMLElement.prototype.attachShadow;
const ____isWindow____ = () => {
  try {
    return window;
  } catch(e) {
    return false;
  }
};

const ____hasWindow____ = ____isWindow____();
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
  if (____hasWindow____) {

    const template = base.setupTemplate({
      name: name,
      shady: !____ShadowDOMV1____
    });

    if (____CustomElementsV1____) {
      klass = class extends _class {
        constructor() {
          super();
          base.constructorCallback(this, _class, template, ____hasWindow____, !____ShadowDOMV1____);
        }
        connectedCallback() {
          base.connectedCallback(this, _class, template);
        }
        disconnectedCallback() {
          if (this.disconnected) this.disconnected();
        }
      }
      if (base.shouldRegister(name, klass)) {
        customElements.define(name, klass);
      };
    } else {
      console.warn('unsupported environment, failed importing polyfills for customElementsV1');
    }
  } else {
    // TODO: handle Commonjs (properties, observers, etc ...)
    klass = class extends _class {
      constructor() {
        super();
        base.constructorCallback(this, _class, template, ____hasWindow____, !____ShadowDOMV1____);
      }
      connectedCallback() {
        base.connectedCallback(this, _class, template);
      }
      disconnectedCallback() {
        if (this.disconnected) this.disconnected();
      }
    };
  }
  return window[_class.name] = klass;
};

window.dispatchEvent(new CustomEvent('backed-ready'));
