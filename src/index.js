'use strict';
import Backed from './backed.js';
import polyLoader from './poly-loader.js';
if (!Boolean('backed' in window)) {
  // import polyfills when needed
  polyLoader().then(() => {
    window.Backed = window.Backed || new Backed();
  });
}
