import { html, render } from './../../node_modules/lit-html/lit-html.js';
import { repeat } from './../../node_modules/lit-html/lib/repeat.js';
window.html = window.html || html;
window.repeat = window.repeat || repeat;
window.Backed = window.Backed || {};
window.Backed.Renderer = window.Backed.Renderer || render;

/**
 * @module LitMixin
 * @mixin Backed
 * @param {class} base class to extend from
 */
export default base => {
 return class LitMixin extends base {
   get propertyStore() {
     return window.Backed.PropertyStore;
   }
   constructor(options = {}) {
     super(options);
     if (!this.shadowRoot) this.attachShadow({mode: 'open'});
     if (!this._isValidRenderer(this.render)) throw 'Invalid renderer!'
   }
   connectedCallback() {
     if (super.connectedCallback) super.connectedCallback();
     if (this.render) render(this.render(), this.shadowRoot);
     else throw 'Missing render method!';
   }
   _isValidRenderer(renderer) {
     if (!renderer) {
       return;
     }
     return String(renderer).includes('return html`') || String(renderer).includes('return this.template')
   }
 }
}
