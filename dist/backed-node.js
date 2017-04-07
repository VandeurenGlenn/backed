'use strict';

var setupTemplate = function setupTemplate(_ref) {
  var _ref$name = _ref.name,
      name = _ref$name === undefined ? null : _ref$name,
      _ref$shady = _ref.shady,
      shady = _ref$shady === undefined ? false : _ref$shady;
  try {
    var ownerDocument = document.currentScript.ownerDocument;
    var template = ownerDocument.querySelector('template[id="' + name + '"]');
    if (template) {
      if (shady) {
        ShadyCSS.prepareTemplate(template, name);
      }
      return template;
    }
  } catch (e) {
    return console.warn(e);
  }
};
var handleShadowRoot = function handleShadowRoot(_ref2) {
  var _ref2$target = _ref2.target,
      target = _ref2$target === undefined ? HTMLElement : _ref2$target,
      _ref2$template = _ref2.template,
      template = _ref2$template === undefined ? null : _ref2$template;
  if (!target.shadowRoot) {
    target.attachShadow({ mode: 'open' });
    if (template) {
      target.shadowRoot.appendChild(document.importNode(template.content, true));
    }
  }
};
var handleProperties = function handleProperties(target, properties) {
  if (properties) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;
    try {
      for (var _iterator = Object.keys(properties)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var property = _step.value;
        var observer = properties[property].observer;
        var strict = properties[property].strict;
        var isGlobal = properties[property].global;
        handlePropertyObserver(target, property, observer, {
          strict: strict || false,
          global: isGlobal || false
        });
        target[property] = properties[property].value;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
};
var handlePropertyObserver = function handlePropertyObserver(obj, property, observer) {
  var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    strict: false, global: false
  };
  if (observer && _needsObserverSetup(obj, property)) {
    obj.observedProperties.push(property);
    if (opts.global && obj[observer]) {
      PubSub.subscribe('global.' + property, obj[observer].bind(obj));
    }
    setupObserver(obj, property, observer, opts);
  }
};
var _needsObserverSetup = function _needsObserverSetup(obj, property) {
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
var forObservers = function forObservers(target, observers) {
  var isGlobal = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;
  try {
    for (var _iterator2 = observers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var observe = _step2.value;
      var parts = observe.split(/\(|\)/g);
      var fn = parts[0];
      parts = parts.slice(1);
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;
      try {
        for (var _iterator3 = parts[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var property = _step3.value;
          if (property.length) {
            handlePropertyObserver(target, property, fn, {
              strict: false,
              global: isGlobal
            });
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
};
var setupObserver = function setupObserver(obj, property, fn) {
  var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    strict: false, global: false
  };
  var isConfigurable = opts.strict ? false : true;
  Object.defineProperty(obj, property, {
    set: function set(value) {
      if (this['_' + property] === value) {
        return;
      }
      this['_' + property] = value;
      var data = {
        property: property,
        value: value
      };
      if (opts.global) {
        data.instance = this;
        PubSub.publish('global.' + property, data);
      } else {
        this[fn](data);
      }
    },
    get: function get() {
      return this['_' + property];
    },
    configurable: isConfigurable
  });
};
var handleObservers = function handleObservers(target) {
  var observers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var globalObservers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  if (!observers && !globalObservers) {
    return;
  }
  forObservers(target, observers);
};
var ready = function ready(target) {
  requestAnimationFrame(function () {
    if (target.ready) target.ready();
  });
};
var base = {
  setupTemplate: setupTemplate.bind(undefined),
  handleShadowRoot: handleShadowRoot.bind(undefined),
  handleProperties: handleProperties.bind(undefined),
  handlePropertyObserver: handlePropertyObserver.bind(undefined),
  handleObservers: handleObservers.bind(undefined),
  setupObserver: setupObserver.bind(undefined),
  ready: ready.bind(undefined)
};

var fireEvent = (function () {
  var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : String;
  var detail = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var target = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : document;
  target.dispatchEvent(new CustomEvent(type, { detail: detail }));
});

var toJsProp = (function (string) {
  var parts = string.split('-');
  if (parts.length > 1) {
    var upper = parts[1].charAt(0).toUpperCase();
    string = parts[0] + upper + parts[1].slice(1).toLowerCase();
  }
  return string;
});

var loadScript = function loadScript(src) {
  return new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.src = src;
    script.onload = function (result) {
      resolve(result);
    };
    script.onerror = function (error) {
      reject(error);
    };
    document.body.appendChild(script);
  });
};

var _class = function () {
  function _class() {
    babelHelpers.classCallCheck(this, _class);
    this.handlers = [];
  }
  babelHelpers.createClass(_class, [{
    key: 'subscribe',
    value: function subscribe(event, handler, context) {
      if (typeof context === 'undefined') {
        context = handler;
      }
      this.handlers.push({ event: event, handler: handler.bind(context) });
    }
  }, {
    key: 'publish',
    value: function publish(event, change) {
      for (var i = 0; i < this.handlers.length; i++) {
        if (this.handlers[i].event === event) {
          var oldValue = this.handlers[i].oldValue;
          if (oldValue !== change.value) {
            this.handlers[i].handler(change, this.handlers[i].oldValue);
            this.handlers[i].oldValue = change.value;
          }
        }
      }
    }
  }]);
  return _class;
}();

var PubSubLoader = (function (isWindow) {
  if (isWindow) {
    window.PubSub = window.PubSub || new _class();
  } else {
    global.PubSub = global.PubSub || new _class();
  }
});

var supportsCustomElementsV1 = 'customElements' in window;
var supportsCustomElementsV0 = 'registerElement' in document;
var supportsShadowDOMV1 = !!HTMLElement.prototype.attachShadow;
var isWindow = function isWindow() {
  try {
    return window;
  } catch (e) {
    return false;
  }
};
var backed = (function (_class) {
  var upperToHyphen = function upperToHyphen(string) {
    return string.replace(/([A-Z])/g, "-$1").toLowerCase().replace('-', '');
  };
  var klass = void 0;
  var name = _class.is || upperToHyphen(_class.name);
  if (isWindow()) {
    var template = base.setupTemplate({
      name: name,
      shady: !supportsShadowDOMV1
    });
    if (supportsCustomElementsV1) {
      klass = function (_class2) {
        babelHelpers.inherits(klass, _class2);
        function klass() {
          babelHelpers.classCallCheck(this, klass);
          var _this = babelHelpers.possibleConstructorReturn(this, (klass.__proto__ || Object.getPrototypeOf(klass)).call(this));
          if (!supportsShadowDOMV1) {
            ShadyCSS.styleElement(_this);
          }
          if (!_this.registered && _this.created) _this.created();
          _this._created();
          return _this;
        }
        babelHelpers.createClass(klass, [{
          key: 'connectedCallback',
          value: function connectedCallback() {
            base.handleShadowRoot({ target: this, template: template });
            if (this.connected) this.connected();
          }
        }, {
          key: 'disconnectedCallback',
          value: function disconnectedCallback() {
            if (this.disconnected) this.disconnected();
          }
        }, {
          key: '_created',
          value: function _created() {
            PubSubLoader(isWindow());
            this.fireEvent = fireEvent.bind(this);
            this.toJsProp = toJsProp.bind(this);
            this.loadScript = loadScript.bind(this);
            base.handleProperties(this, _class.properties);
            base.handleObservers(this, _class.observers, _class.globalObservers);
            base.ready(this);
            this.registered = true;
          }
        }]);
        return klass;
      }(_class);
      customElements.define(name, klass);
    } else if (supportsCustomElementsV0) {
      klass = document.registerElement(name, function (_class4) {
        babelHelpers.inherits(_class3, _class4);
        function _class3() {
          babelHelpers.classCallCheck(this, _class3);
          return babelHelpers.possibleConstructorReturn(this, (_class3.__proto__ || Object.getPrototypeOf(_class3)).apply(this, arguments));
        }
        babelHelpers.createClass(_class3, [{
          key: 'createdCallback',
          value: function createdCallback() {
            if (!supportsShadowDOMV1) {
              ShadyCSS.styleElement(this);
            }
            if (!this.registered && this.created) this.created();
            this._created();
          }
        }, {
          key: 'attachedCallback',
          value: function attachedCallback() {
            base.handleShadowRoot({ target: this, template: template });
            if (this.connected) this.connected();
          }
        }, {
          key: 'detachedCallback',
          value: function detachedCallback() {
            if (this.disconnected) this.disconnected();
          }
        }, {
          key: '_created',
          value: function _created() {
            PubSubLoader(isWindow());
            this.fireEvent = fireEvent.bind(this);
            this.toJsProp = toJsProp.bind(this);
            this.loadScript = loadScript.bind(this);
            base.handleProperties(this, _class.properties);
            base.handleObservers(this, _class.observers, _class.globalObservers);
            base.ready(this);
            this.registered = true;
          }
        }, {
          key: 'attachShadow',
          value: function attachShadow() {
            return this.createShadowRoot();
          }
        }]);
        return _class3;
      }(_class));
    } else {
      console.warn('classes::unsupported');
    }
  } else {
    klass = _class;
  }
  return klass;
});

module.exports = backed;
//# sourceMappingURL=backed-node.js.map
