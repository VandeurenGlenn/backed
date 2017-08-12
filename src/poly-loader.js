'use strict';
import loadScript from './internals/load-script';

const bowerMinUrl = (name, main, root) => {
  const url = main ? `${name}/${main}` : `${name}/${name}`;
  return `${root}/${url}.min.js`;
}

const ensureArray = array => {
  if (Array.isArray(array)) {
    return array;
  }
  return [...array];
}

/**
 * @module polyLoader
 * @param {string} name package name (folder)
 * @param {string} main script to use
 * @param {string} root location of your components
 */
export default (fills, root='bower_components') => {
  return new Promise((resolve, reject) => {
    fills = ensureArray(fills);
    fills = fills.map(fill => {
      if (fill.name === 'shadycss' && !fill.main) {
        fill.main = 'custom-style-interface';
      }
      return loadScript(bowerMinUrl(fill.name, fill.main, root));
    });
    promises.all(fills).then(() => {
      resolve();
    }).catch(error => reject(error));
  });
}
