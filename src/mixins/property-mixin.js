window.Backed = window.Backed || {};
// binding does it's magic using the propertyStore ...
window.Backed.PropertyStore = window.Backed.PropertyStore || new Map();

const render = window.Backed.Renderer;
// TODO: Create & add global observer
export default base => {
  return class PropertyMixin extends base {
    constructor(options) {
      super(options);
      if (options.properties) {
        for (const entry of Object.entries(options.properties)) {
          const {observer, reflect, renderer} = entry[1];
          if (observer || reflect || renderer) {
            if (renderer && !render) {
              console.warn('Renderer undefined');
            }
            // TODO: test first
            // if (options.async) {
            //   return new Promise((resolve, reject) => {
            //     this.defineProperty(entry[0], entry[1]);
            //     resolve();
            //   });
            // } else {
            // check if attribute is defined and update property with it's value
            // else fallback to it's default value (if any)
            this.defineProperty(entry[0], entry[1]);
            this[entry[0]] = this.hasAttribute(entry[0]) ?
              this.getAttribute(entry[0]) : entry[1].value;
            // }
          }
        }
      }
    }

    /**
     * @param {function} options.observer callback function returns {instance, property, value}
     * @param {boolean} options.reflect when true, reflects value to attribute
     * @param {function} options.render callback function for renderer (example: usage with lit-html, {render: render(html, shadowRoot)})
     */
    defineProperty(property = null, {strict = false, observer, reflect = false, renderer}) {
      Object.defineProperty(this, property, {
        set(value) {
          if (value === this[`___${property}`]) return;
          this[`___${property}`] = value;

          if (reflect) {
            if (value) this.setAttributte(property, String(value));
            else this.removeAttribute(property);
          }

          if (observer) {
            if (observer in this) this[observer]();
            else console.warn(`observer::${observer} undefined`);
          }

          if (renderer) {
            if (renderer in this) render(this[renderer](), this.shadowRoot);
            else console.warn(`renderer::${renderer} undefined`);
          }

        },
        get() {
          return this[`___${property}`];
        },
        configurable: strict ? false : true
      });
    }
  }
}
