const handleProperties = (target, properties) => {
  if (properties) {
    for (let property of Object.keys(properties)) {
      const observer = properties[property].observer;
      const strict = properties[property].strict;
      handlePropertyObserver(target, property, strict, observer);
      // Bind(superclass, superclass.properties)
    }
  }
};

const handlePropertyObserver = (obj, property, strict, observer) => {
  if (observer && _needsObserverSetup(obj, property)) {
    obj.observedProperties.push(property);
    setupObserver(obj, property, strict, observer);
  }
};

const _needsObserverSetup = (obj, property) => {
  if (!obj.observedProperties) {
    obj.observedProperties = [];
  }
  if (obj.observedProperties[property]) {
    console.warn(
      'observer::ignoring duplicate property observer ' + property
    );
    return false;
  } else {
    return true;
  }
};

/**
 * Runs a method on target whenever given property changes
 *
 * example:
 * change(change) {
 *  change.property // name of the property
 *  change.value // value of the property
 * }
 *
 * @arg {object} obj target
 * @arg {string} property name
 * @arg {boolean} strict
 * @arg {method} fn The method to run on change
 */
const setupObserver = (obj, property, strict=false, fn) => {
  Object.defineProperty(obj, property, {
    set(value) {
      let data = {
        property: property,
        value: value
      };
      this[fn](data);
      PubSub.publish(fn, data);
    },
    configurable: strict ? false : true
  });
};


const handleObservers = (obj, observers) => {
  if (!observers) {
    return;
  }
  for (let observe of observers) {
    let parts = observe.split(/\(|\)/g);
    let fn = parts[0];
    parts = parts.slice(1);
    for (property of parts) {
      if (property.length) {
        handlePropertyObserver(obj, property, false, fn);
      }
    }
  }
};

var Utils = {
  handleProperties: handleProperties.bind(undefined),
  handlePropertyObserver: handlePropertyObserver.bind(undefined),
  handleObservers: handleObservers.bind(undefined),
  setupObserver: setupObserver.bind(undefined)
};

var fireEvent = (type=String, detail=null, target=document) => {
  target.dispatchEvent(new CustomEvent(type, {detail: detail}));
};

var toJsProp = string => {
  let parts = string.split('-');
  if (parts.length > 1) {
    var upper = parts[1].charAt(0).toUpperCase();
    string = parts[0] + upper + parts[1].slice(1).toLowerCase();
  }
  return string;
};

var Pubsub = class {

  /**
   * Creates handlers
   */
  constructor() {
    this.handlers = [];
  }

  /**
   * @param {String} event
   * @param {Method} handler
   * @param {HTMLElement} context
   */
  subscribe(event, handler, context) {
    if (typeof context === 'undefined') {
      context = handler;
    }
    this.handlers.push({event: event, handler: handler.bind(context)});
  }

  /**
   * @param {String} event
   * @param {String|Number|Boolean|Object|Array} value
   */
  publish(event, value) {
    for (let i = 0; i < this.handlers.length; i++) {
      if (this.handlers[i].event === event) {
        this.handlers[i].handler(event, value, this.handlers[i].oldValue);
        this.handlers[i].oldValue = value;
      }
    }
  }
};

var PubSubLoader = () => {
  window.PubSub = window.PubSub || new Pubsub();
};

PubSubLoader();

/**
 *
 * @module backed
 * @arg {class} _class
 */
var Backed = _class => {
  const upperToHyphen = string => {
    return string.replace(/([A-Z])/g, "-$1").toLowerCase().replace('-', '');
  };

  // get the tagName or try to make one with class.name
  let name = _class.is || upperToHyphen(_class.name);
  // Setup properties & mixins
  // define/register custom-element
  customElements.define(name, class extends _class {
    constructor() {
      super();
      this.fireEvent = fireEvent.bind(this);
      this.toJsProp = toJsProp.bind(this);

      Utils.handleProperties(this, _class.properties);
      Utils.handleObservers(this, _class.observers);
    }
  });
};

window.Backed = window.Backed || new Backed();
//# sourceMappingURL=backed.js.map
