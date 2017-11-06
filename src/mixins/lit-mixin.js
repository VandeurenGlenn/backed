import { html, render } from './../../node_modules/lit-html/lit-html.js';
window.html = window.html || html;
window.Backed = window.Backed || {};
window.Backed.Renderer = window.Backed.Renderer || render;

/**
 * @module LitMixin
 * @mixin Backed
 * @param {class} base class to extend from
 */
export default base => {
  return class LitMixin extends base {
    constructor(options = {}) {
      super(options);
      if (!this.shadowRoot) this.attachShadow({mode: 'open'});
      this._isValidRenderer(this.render);
    }
    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();
      if (this.render) {
        render(this.render(), this.shadowRoot);
        this.rendered = true;
      };
    }
    _isValidRenderer(renderer) {
      if (!renderer) {
       throw 'Missing render method!';
       return;
      }
      if (!String(renderer).includes('return html`') &&
         !String(renderer).includes('template')) {
         throw 'Invalid renderer!';
      }
    }
  }
}
