'use strict';
import Utils from './utils';
import fireEvent from './internals/fire-event.js';
import toJsProp from './internals/to-js-prop.js';
import loadScript from './internals/load-script.js';
import PubSubLoader from './internals/pub-sub-loader.js';
PubSubLoader();

/**
 *
 * @module backed
 * @param {class} _class
 */
export default _class => {
  const upperToHyphen = string => {
    return string.replace(/([A-Z])/g, "-$1").toLowerCase().replace('-', '');
  };

  const isNode= () => {
    try {
      return this===global;
    }catch(e){
      return false;
    }
  };

  const construct = (name, _class) => {
    if (isNode()) {
      return _class;
    } else {
      customElements.define(name, _class);
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
