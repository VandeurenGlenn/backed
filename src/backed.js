'use strict';
import base from './base.js';

const isWindow = () => {
  try {
    return window;
  } catch(e) {
    return false;
  }
};

const hasWindow = isWindow();

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
  if (hasWindow) {
    const supportsCustomElementsV1 = 'customElements' in window;
    const supportsShadowDOMV1 = !!HTMLElement.prototype.attachShadow;

    const template = base.setupTemplate({
      name: name,
      shady: !supportsShadowDOMV1
    });

    if (supportsCustomElementsV1) {
      klass = class extends _class {
        constructor() {
          super();
          base.constructorCallback(this, _class, template, hasWindow, !supportsShadowDOMV1);
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
    klass = _class;
  }
  return window[_class.name] = klass;
};

window.dispatchEvent(new CustomEvent('backed-ready'));
