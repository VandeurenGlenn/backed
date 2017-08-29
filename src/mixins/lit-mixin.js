import { html, render } from 'node_modules/lit-html/lit-html.js';

window.html = window.html || html;
/**
 * @module PropertyMixin
 * @mixin Backed
 * @param {class} base class to extend from
 */
export default base => {
    return class extends base {
      constructor() {
        super();
        this.attachShadow({mode: 'open'});
        render(this.render(), this.shadowRoot);
      }
    }
  }
