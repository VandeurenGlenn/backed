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
}

const handlePropertyObserver = (obj, property, observer, opts={
  strict: false, global:false
}) => {

  if (observer && _needsObserverSetup(obj, property)) {
    obj.observedProperties.push(property);

    if (opts.global) {
      PubSub.subscribe(`global.${property}`, obj[observer]);
    }
    setupObserver(obj, property, observer, opts)
  }
}

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
}

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
}

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
}


const handleObservers = (target, observers=[], globalObservers=[]) => {
  if (!observers && !globalObservers) {
    return;
  }
  forObservers(target, observers);
}

export default {
  handleProperties: handleProperties.bind(this),
  handlePropertyObserver: handlePropertyObserver.bind(this),
  handleObservers: handleObservers.bind(this),
  setupObserver: setupObserver.bind(this)
}
