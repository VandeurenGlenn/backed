var fireEvent = ((type = String, detail = null, target = document) => {
  target.dispatchEvent(new CustomEvent(type, { detail: detail }));
});

var toJsProp = (string => {
  let parts = string.split('-');
  if (parts.length > 1) {
    var upper = parts[1].charAt(0).toUpperCase();
    string = parts[0] + upper + parts[1].slice(1).toLowerCase();
  }
  return string;
});

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
  constructor() {
    this.handlers = [];
  }
  subscribe(event, handler, context) {
    if (typeof context === 'undefined') {
      context = handler;
    }
    this.handlers.push({ event: event, handler: handler.bind(context) });
  }
  publish(event, change) {
    for (let i = 0; i < this.handlers.length; i++) {
      if (this.handlers[i].event === event) {
        let oldValue = this.handlers[i].oldValue;
        if (oldValue !== change.value) {
          this.handlers[i].handler(change, this.handlers[i].oldValue);
          this.handlers[i].oldValue = change.value;
        }
      }
    }
  }
};

var PubSubLoader = (isWindow => {
  if (isWindow) {
    window.PubSub = window.PubSub || new Pubsub();
  } else {
    global.PubSub = global.PubSub || new Pubsub();
  }
});

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const templates = new Map();
function html(strings, ...values) {
    let template = templates.get(strings);
    if (template === undefined) {
        template = new Template(strings);
        templates.set(strings, template);
    }
    return new TemplateResult(template, values);
}
class TemplateResult {
    constructor(template, values) {
        this.template = template;
        this.values = values;
    }
}
function render(result, container) {
    let instance = container.__templateInstance;
    if (instance !== undefined && instance.template === result.template && instance instanceof TemplateInstance) {
        instance.update(result.values);
        return;
    }
    instance = new TemplateInstance(result.template);
    container.__templateInstance = instance;
    const fragment = instance._clone();
    instance.update(result.values);
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    container.appendChild(fragment);
}
const exprMarker = '{{}}';
class TemplatePart {
    constructor(type, index, name, rawName, strings) {
        this.type = type;
        this.index = index;
        this.name = name;
        this.rawName = rawName;
        this.strings = strings;
    }
}
class Template {
    constructor(strings) {
        this.parts = [];
        this._strings = strings;
        this._parse();
    }
    _parse() {
        this.element = document.createElement('template');
        this.element.innerHTML = this._getTemplateHtml(this._strings);
        const walker = document.createTreeWalker(this.element.content, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        let index = -1;
        let partIndex = 0;
        const nodesToRemove = [];
        const attributesToRemove = [];
        while (walker.nextNode()) {
            index++;
            const node = walker.currentNode;
            if (node.nodeType === Node.ELEMENT_NODE) {
                const attributes = node.attributes;
                for (let i = 0; i < attributes.length; i++) {
                    const attribute = attributes.item(i);
                    const value = attribute.value;
                    const strings = value.split(exprMarker);
                    if (strings.length > 1) {
                        const attributeString = this._strings[partIndex];
                        const rawNameString = attributeString.substring(0, attributeString.length - strings[0].length);
                        const match = rawNameString.match(/((?:\w|[.\-_$])+)=["']?$/);
                        const rawName = match[1];
                        this.parts.push(new TemplatePart('attribute', index, attribute.name, rawName, strings));
                        attributesToRemove.push(attribute);
                        partIndex += strings.length - 1;
                    }
                }
            } else if (node.nodeType === Node.TEXT_NODE) {
                const strings = node.nodeValue.split(exprMarker);
                if (strings.length > 1) {
                    partIndex += strings.length - 1;
                    for (let i = 0; i < strings.length; i++) {
                        const string = strings[i];
                        const literalNode = new Text(string);
                        node.parentNode.insertBefore(literalNode, node);
                        index++;
                        if (i < strings.length - 1) {
                            node.parentNode.insertBefore(new Text(), node);
                            node.parentNode.insertBefore(new Text(), node);
                            this.parts.push(new TemplatePart('node', index));
                            index += 2;
                        }
                    }
                    index--;
                    nodesToRemove.push(node);
                } else if (!node.nodeValue.trim()) {
                    nodesToRemove.push(node);
                    index--;
                }
            }
        }
        for (const n of nodesToRemove) {
            n.parentNode.removeChild(n);
        }
        for (const a of attributesToRemove) {
            a.ownerElement.removeAttribute(a.name);
        }
    }
    _getTemplateHtml(strings) {
        const parts = [];
        for (let i = 0; i < strings.length; i++) {
            parts.push(strings[i]);
            if (i < strings.length - 1) {
                parts.push(exprMarker);
            }
        }
        return parts.join('');
    }
}
class Part {
    constructor(instance) {
        this.instance = instance;
    }
    _getValue(value) {
        if (typeof value === 'function') {
            try {
                value = value(this);
            } catch (e) {
                console.error(e);
                return;
            }
        }
        if (value === null) {
            return undefined;
        }
        return value;
    }
}
class AttributePart extends Part {
    constructor(instance, element, name, strings) {
        super(instance);
        console.assert(element.nodeType === Node.ELEMENT_NODE);
        this.element = element;
        this.name = name;
        this.strings = strings;
    }
    setValue(values) {
        const strings = this.strings;
        let text = '';
        for (let i = 0; i < strings.length; i++) {
            text += strings[i];
            if (i < strings.length - 1) {
                const v = this._getValue(values[i]);
                if (v && typeof v !== 'string' && v[Symbol.iterator]) {
                    for (const t of v) {
                        text += t;
                    }
                } else {
                    text += v;
                }
            }
        }
        this.element.setAttribute(this.name, text);
    }
    get size() {
        return this.strings.length - 1;
    }
}
class NodePart extends Part {
    constructor(instance, startNode, endNode) {
        super(instance);
        this.startNode = startNode;
        this.endNode = endNode;
    }
    setValue(value) {
        value = this._getValue(value);
        if (value instanceof Node) {
            this._previousValue = this._setNodeValue(value);
        } else if (value instanceof TemplateResult) {
            this._previousValue = this._setTemplateResultValue(value);
        } else if (value && value.then !== undefined) {
            value.then(v => {
                if (this._previousValue === value) {
                    this.setValue(v);
                }
            });
            this._previousValue = value;
        } else if (value && typeof value !== 'string' && value[Symbol.iterator]) {
            this._previousValue = this._setIterableValue(value);
        } else if (this.startNode.nextSibling === this.endNode.previousSibling && this.startNode.nextSibling.nodeType === Node.TEXT_NODE) {
            this.startNode.nextSibling.textContent = value;
            this._previousValue = value;
        } else {
            this._previousValue = this._setTextValue(value);
        }
    }
    _insertNodeBeforeEndNode(node) {
        this.endNode.parentNode.insertBefore(node, this.endNode);
    }
    _setNodeValue(value) {
        this.clear();
        this._insertNodeBeforeEndNode(value);
        return value;
    }
    _setTextValue(value) {
        return this._setNodeValue(new Text(value));
    }
    _setTemplateResultValue(value) {
        let instance;
        if (this._previousValue && this._previousValue._template === value.template) {
            instance = this._previousValue;
        } else {
            instance = this.instance._createInstance(value.template);
            this._setNodeValue(instance._clone());
        }
        instance.update(value.values);
        return instance;
    }
    _setIterableValue(value) {
        let itemStart = this.startNode;
        let itemEnd;
        const values = value[Symbol.iterator]();
        const previousParts = Array.isArray(this._previousValue) ? this._previousValue : undefined;
        let previousPartsIndex = 0;
        const itemParts = [];
        let current = values.next();
        let next = values.next();
        if (current.done) {
            this.clear();
        }
        while (!current.done) {
            let itemPart;
            if (previousParts !== undefined && previousPartsIndex < previousParts.length) {
                itemPart = previousParts[previousPartsIndex++];
                if (next.done && itemPart.endNode !== this.endNode) {
                    this.clear(itemPart.endNode.previousSibling);
                    itemPart.endNode = this.endNode;
                }
                itemEnd = itemPart.endNode;
            } else {
                if (next.done) {
                    itemEnd = this.endNode;
                } else {
                    itemEnd = new Text();
                    this._insertNodeBeforeEndNode(itemEnd);
                }
                itemPart = new NodePart(this.instance, itemStart, itemEnd);
            }
            itemPart.setValue(current.value);
            itemParts.push(itemPart);
            current = next;
            next = values.next();
            itemStart = itemEnd;
        }
        return itemParts;
    }
    clear(startNode = this.startNode) {
        this._previousValue = undefined;
        let node = startNode.nextSibling;
        while (node !== null && node !== this.endNode) {
            let next = node.nextSibling;
            node.parentNode.removeChild(node);
            node = next;
        }
    }
}
class TemplateInstance {
    constructor(template) {
        this._parts = [];
        this._template = template;
    }
    get template() {
        return this._template;
    }
    update(values) {
        let valueIndex = 0;
        for (const part of this._parts) {
            if (part.size === undefined) {
                part.setValue(values[valueIndex++]);
            } else {
                part.setValue(values.slice(valueIndex, valueIndex + part.size));
                valueIndex += part.size;
            }
        }
    }
    _clone() {
        const fragment = document.importNode(this._template.element.content, true);
        if (this._template.parts.length > 0) {
            const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
            const parts = this._template.parts;
            let index = 0;
            let partIndex = 0;
            let templatePart = parts[0];
            let node = walker.nextNode();
            while (node != null && partIndex < parts.length) {
                if (index === templatePart.index) {
                    this._parts.push(this._createPart(templatePart, node));
                    templatePart = parts[++partIndex];
                } else {
                    index++;
                    node = walker.nextNode();
                }
            }
        }
        return fragment;
    }
    _createPart(templatePart, node) {
        if (templatePart.type === 'attribute') {
            return new AttributePart(this, node, templatePart.name, templatePart.strings);
        } else if (templatePart.type === 'node') {
            return new NodePart(this, node, node.nextSibling);
        } else {
            throw new Error(`unknown part type: ${templatePart.type}`);
        }
    }
    _createInstance(template) {
        return new TemplateInstance(template);
    }
}

window.registeredElements = window.registeredElements || [];
const handleProperties = (target, properties) => {
  if (properties) {
    for (let entry of Object.entries(properties)) {
      handleProperty(target, entry[0], entry[1]);
      target[entry[0]] = target.hasAttribute(entry[0]) ? target.getAttribute(entry[0]) : entry[1].value;
    }
  }
};
const handleProperty = (obj, property, { observer, strict, global, reflect, render: render$$1, value }) => {
  if (Boolean(observer || global) && _needsObserverSetup(obj, property)) {
    obj.observedProperties.push(property);
    if (global && obj[observer]) {
      PubSub.subscribe(`global.${property}`, obj[observer].bind(obj));
    }
    setupObserver(obj, property, observer, { strict, global, reflect, renderer: render$$1 });
  } else if (!Boolean(observer || global) && Boolean(reflect || render$$1)) {
    setupObserver(obj, property, observer, { strict, global, reflect, renderer: render$$1 });
  }
};
const _needsObserverSetup = (obj, property) => {
  if (!obj.observedProperties) {
    obj.observedProperties = [];
  }
  if (obj.observedProperties[property]) {
    console.warn('observer::ignoring duplicate property observer ' + property);
    return false;
  } else {
    return true;
  }
};
const forObservers = (target, observers, isGlobal = false) => {
  for (let observe of observers) {
    let parts = observe.split(/\(|\)/g);
    let fn = parts[0];
    parts = parts.slice(1);
    for (let property of parts) {
      if (property.length) {
        handleProperty(target, property, fn, {
          strict: false,
          global: isGlobal
        });
      }
    }
  }
};
const setupObserver = (obj, property, fn, { strict, global, reflect, renderer }) => {
  Object.defineProperty(obj, property, {
    set(value) {
      if (value === undefined) {
        return;
      }
      if (this[`_${property}`] === value) {
        return;
      }
      this[`_${property}`] = value;
      let data = {
        property: property,
        value: value
      };
      if (reflect) {
        if (value) this.setAttribute(property, String(value));else this.removeAttribute(property);
      }
      if (renderer) {
        if (typeof renderer === 'boolean') {
          render(this.render(), this.shadowRoot);
        } else {
          render(this[renderer](), this.shadowRoot);
        }
      }
      if (global) {
        data.instance = this;
        PubSub.publish(`global.${property}`, data);
      } else if (fn) {
        if (this[fn]) {
          this[fn](data);
        } else {
          console.warn(`observer undefined::${fn} is not a function`);
        }
      }
    },
    get() {
      return this[`_${property}`];
    },
    configurable: strict ? false : true
  });
};
const handleObservers = (target, observers = [], globalObservers = []) => {
  if (!observers && !globalObservers) {
    return;
  }
  forObservers(target, observers);
};
const handleListeners = target => {
  const attributes = target.attributes;
  for (const attribute of attributes) {
    if (String(attribute.name).includes('on-')) {
      const fn = attribute.value;
      const name = attribute.name.replace('on-', '');
      target.addEventListener(String(name), event => {
        target = event.path[0];
        while (!target.host) {
          target = target.parentNode;
        }
        if (target.host[fn]) {
          target.host[fn](event);
        }
      });
    }
  }
};
const ready = target => {
  requestAnimationFrame(() => {
    if (target.ready) target.ready();
  });
};
const constructorCallback = (target = HTMLElement, klass = Function, hasWindow = false) => {
  PubSubLoader(hasWindow);
  target.fireEvent = target.fireEvent || fireEvent.bind(target);
  target.toJsProp = target.toJsProp || toJsProp.bind(target);
  target.loadScript = target.loadScript || loadScript.bind(target);
  handleProperties(target, klass.properties);
  handleObservers(target, klass.observers, klass.globalObservers);
  if (!target.registered && target.created) target.created();
  target.registered = true;
};
const connectedCallback = (target = HTMLElement, klass = Function) => {
  if (target.connected) target.connected();
  handleListeners(target);
  ready(target);
};
const shouldRegister = (name, klass) => {
  if (window.registeredElements.indexOf(name) === -1) {
    window.registeredElements.push(name);
    return true;
  }
  return false;
};
var base = {
  ready: ready,
  connectedCallback: connectedCallback,
  constructorCallback: constructorCallback,
  shouldRegister: shouldRegister
};

let sheduled = false;
const afterRenderQue = [];
const beforeRenderQue = [];
const callMethod = array => {
  const context = array[0];
  const callback = array[1];
  const args = array[2];
  try {
    callback.apply(context, args);
  } catch (e) {
    setTimeout(() => {
      throw e;
    });
  }
};
const flushQue = que => {
  while (que.length) {
    callMethod(que.shift);
  }
};
const runQue = que => {
  for (let i = 0, l = que.length; i < l; i++) {
    callMethod(que.shift());
  }
  sheduled = false;
};
const shedule = () => {
  sheduled = true;
  requestAnimationFrame(() => {
    flushQue(beforeRenderQue);
    setTimeout(() => {
      runQue(afterRenderQue);
    });
  });
};
var renderStatus = {
  afterRender: (context, callback, args) => {
    if (!sheduled) {
      shedule();
    }
    afterRenderQue.push([context, callback, args]);
  },
  beforeRender: (context, callback, args) => {
    if (!sheduled) {
      shedule();
    }
    beforeRenderQue.push([context, callback, args]);
  }
};

const ____isWindow____ = () => {
  try {
    return window;
  } catch (e) {
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
var backed = (_class => {
  const upperToHyphen = string => {
    return string.replace(/([A-Z])/g, "-$1").toLowerCase().replace('-', '');
  };
  let klass;
  let name = _class.is || upperToHyphen(_class.name);
  let hasRenderer = false;
  if (____hasWindow____) {
    const observedAttributes = [];
    for (const property of Object.entries(_class.properties)) {
      const { reflect, render: render$$1 } = property[1];
      if (reflect) {
        observedAttributes.push(property[0]);
      }
      if (render$$1) {
        hasRenderer = true;
      }
    }
    klass = class extends _class {
      static get observedAttributes() {
        return observedAttributes;
      }
      constructor() {
        super();
        if (hasRenderer && !this.shadowRoot) {
          this.attachShadow({ mode: 'open' });
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
    };
    if (base.shouldRegister(name, klass)) {
      customElements.define(name, klass);
    }
    return window[_class.name] = klass;
  } else {
  }
});
window.dispatchEvent(new CustomEvent('backed-ready'));

export default backed;
//# sourceMappingURL=backed.js.map
