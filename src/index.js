'use strict';
import Backed from './backed.js';
import polyLoader from './poly-loader.js';
if (!window['Backed']) {
  // import polyfills when needed
  polyLoader().then(() => {
    window['Backed'] = window['Backed'] || new Backed();
  }).catch(error => {
    console.warn(error);
  });
}
