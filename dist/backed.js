var Backed = (function () {
'use strict';

const handleProperties = (target, properties) => {
  if (properties) {
    for (let property of Object.keys(properties)) {
      const observer = properties[property].observer;
      const strict = properties[property].strict;
      const isGlobal = properties[property].global;
      handlePropertyObserver(target, property, observer, {
        strict: strict || false,
        global: isGlobal || false
      });
      // Bind(superclass, superclass.properties)
    }
  }
};

const handlePropertyObserver = (obj, property, observer, opts={
  strict: false, global:false
}) => {

  if (observer && _needsObserverSetup(obj, property)) {
    obj.observedProperties.push(property);

    if (opts.global) {
      PubSub.subscribe(`global.${property}`, obj[observer]);
    }
    setupObserver(obj, property, observer, opts);
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

const forObservers = (target, observers, isGlobal=false) => {
  for (let observe of observers) {
    let parts = observe.split(/\(|\)/g);
    let fn = parts[0];
    parts = parts.slice(1);
    for (let property of parts) {
      if (property.length) {
        handlePropertyObserver(target, property, fn, {
          strict: false,
          global: isGlobal
        });
      }
    }
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
const setupObserver = (obj, property, fn, opts={
  strict: false, global: false
}) => {
  Object.defineProperty(obj, property, {
    set(value) {
      this[`_${property}`] = value;
      let data = {
        property: property,
        value: value
      };
      if (opts.global) {
        data.instance = this;
        PubSub.publish(`global.${property}`, data);
      } else {
        this[fn](data);
      }
    },
    get() {
      return this[`_${property}`];
    },
    configurable: opts.strict
  });
};


const handleObservers = (target, observers=[], globalObservers=[]) => {
  if (!observers && !globalObservers) {
    return;
  }
  forObservers(target, observers);
};

const ready = target => {
  requestAnimationFrame(() => {
    if (target.ready) target.ready();
  });
};

var base = {
  handleProperties: handleProperties.bind(undefined),
  handlePropertyObserver: handlePropertyObserver.bind(undefined),
  handleObservers: handleObservers.bind(undefined),
  setupObserver: setupObserver.bind(undefined),
  ready: ready.bind(undefined)
};

/**
 * @mixin backed
 * @param {string} type Name of the event
 * @param {HTMLElement} target Name of the event
 * @param {string|boolean|number|object|array} detail
 */
var fireEvent = (type=String, detail=null, target=document) => {
  target.dispatchEvent(new CustomEvent(type, {detail: detail}));
};

/**
 * @mixin Backed
 *
 * some-prop -> someProp
 *
 * @arg {string} string The content to convert
 * @return {string} string
 */
var toJsProp = string => {
  let parts = string.split('-');
  if (parts.length > 1) {
    var upper = parts[1].charAt(0).toUpperCase();
    string = parts[0] + upper + parts[1].slice(1).toLowerCase();
  }
  return string;
};

const loadScript = src => {
  return new Promise((resolve, reject) => {
    let script = document.createElement('script');
    script.src = src;
    script.onload = result => {
      resolve(result);
    };
    script.onerror = error => {
      reject(error);
    };
    document.body.appendChild(script);
  });
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
   * @param {String|Number|Boolean|Object|Array} change
   */
  publish(event, change) {
    for (let i = 0; i < this.handlers.length; i++) {
      if (this.handlers[i].event === event) {
        let oldValue = this.handlers[i].oldValue || {};
        // dirty checking value, ensures that we don't create a loop
        if (oldValue.value !== change.value) {
          this.handlers[i].handler(change, this.handlers[i].oldValue);
          this.handlers[i].oldValue = change;
        }
      }
    }
  }
};

var PubSubLoader = isWindow => {
  if (isWindow) {
    window.PubSub = window.PubSub || new Pubsub();
  } else {
    global.PubSub = global.PubSub || new Pubsub();
  }
};

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
var backed = _class => {
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
      };
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
      });
    } else {
      console.warn('classes::unsupported');
    }
  } else {
    // TODO: handle Commonjs (properties, observers, etc ...)
    klass = _class;
  }
  return klass;
};

return backed;

}());
//# sourceMappingURL=backed.js.map
