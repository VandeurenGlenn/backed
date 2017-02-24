'use strict';
// import Bind from './bind.js';

const handleProperties = (target, properties) => {
  if (properties) {
    for (let property of Object.keys(properties)) {
      const observer = properties[property].observer;
      const strict = properties[property].strict;
      handlePropertyObserver(target, property, strict, observer);
      // Bind(superclass, superclass.properties)
    }
  }
}

const handlePropertyObserver = (obj, property, strict, observer) => {
  if (observer && _needsObserverSetup(obj, property)) {
    obj.observedProperties.push(property);
    setupObserver(obj, property, strict, observer)
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
      this[`_${property}`] = value;
      let data = {
        property: property,
        value: value
      };
      this[fn](data);
      PubSub.publish(fn, data);
    },
    get() {
      return this[`_${property}`];
    },
    configurable: strict ? false : true
  });
}


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
}

export default {
  handleProperties: handleProperties.bind(this),
  handlePropertyObserver: handlePropertyObserver.bind(this),
  handleObservers: handleObservers.bind(this),
  setupObserver: setupObserver.bind(this)
}
