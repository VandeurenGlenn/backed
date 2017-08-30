import { html, render } from '/node_modules/lit-html/lit-html.js';

window.html = window.html || html;
window.Backed = window.Backed || {};
window.Backed.Renderer = window.Backed.Renderer || render;

/**
 * @module PropertyMixin
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
     this.attachShadow({mode: 'open'});
     if (!this._isValidRenderer(this.render)) throw 'Invalid renderer!'
     if (this.render) render(this.render(), this.shadowRoot);
     else throw 'Missing render method!';
   }
   _isValidRenderer(renderer) {
     if (!renderer) {
       return;
     }
     return String(renderer).includes('return html`')
   }
 }
}
