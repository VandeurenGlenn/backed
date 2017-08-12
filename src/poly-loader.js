'use strict';
import loadScript from './internals/load-script';
const supportsCustomElementsV1 = 'customElements' in window;
const supportsShadowDOMV1 = !!HTMLElement.prototype.attachShadow;

const imported = {};

const bowerMinUrl = (name, main) => {
  const url = main ? `${name}/${main}` : `${name}/${name}`;
  return `bower_components/${url}.min.js`;
}

export default () => {
  return new Promise((resolve, reject) => {
    const promises = [];
    if (!supportsShadowDOMV1) {
      promises.push(loadScript(bowerMinUrl('shadydom')))
      promises.push(
        loadScript(bowerMinUrl('shadycss', 'custom-style-interface')
      ));
    }
    if (promises.length > 0) {
      Promise.all(promises).then(() => {
        resolve();
      }).catch(error => {
        reject(error);
      });
    } else {
      resolve();
    }
  });
}
