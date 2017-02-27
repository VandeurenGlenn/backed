'use strict';
import Utils from './utils';
import fireEvent from './internals/fire-event.js';
import toJsProp from './internals/to-js-prop.js';
import loadScript from './internals/load-script.js';
import PubSubLoader from './internals/pub-sub-loader.js';

const isWindow = () => {
  try {
    return window;
  } catch(e) {
    return false;
  }
};

PubSubLoader(isWindow());

/**
 *
 * @module backed
 * @param {class} _class
 */
export default _class => {
  const upperToHyphen = string => {
    return string.replace(/([A-Z])/g, "-$1").toLowerCase().replace('-', '');
  };

  const construct = (name, _class) => {
    if (isWindow()) {
      customElements.define(name, _class);
    } else {
      return _class;
    }
  }


  // get the tagName or try to make one with class.name
  let name = _class.is || upperToHyphen(_class.name);
  // Setup properties & mixins
  // define/register custom-element
  return construct(name, class extends _class {
    constructor() {
      super();
      this.fireEvent = fireEvent.bind(this);
      this.toJsProp = toJsProp.bind(this);
      this.loadScript = loadScript.bind(this);

      Utils.handleProperties(this, _class.properties);
      Utils.handleObservers(this, _class.observers);
    }
  });
};
