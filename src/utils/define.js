import hyphenate from './hyphenate.js';
import shouldRegister from './should-register.js';

export default define = klass => {
  const name = hyphenate(klass.name);
  return shouldRegister(name) ? customElements.define(name, klass) : '';
}
