var polyLoader = (function () {
'use strict';

const loadScript = src => {
  return new Promise((resolve, reject) => {
    let script = document.createElement('script');
    script.src = src;
    script.onload = result => {
      resolve(result);
    };
    script.onerror = error => {
      reject(error);
    };
    document.body.appendChild(script);
  });
};

const bowerMinUrl = (name, main, root) => {
  const url = main ? `${name}/${main}` : `${name}/${name}`;
  return `${root}/${url}.min.js`;
};
const ensureArray = array => {
  if (Array.isArray(array)) {
    return array;
  }
  return [...array];
};
var polyLoader = ((fills, root = 'bower_components') => {
  return new Promise((resolve, reject) => {
    fills = ensureArray(fills);
    fills = fills.map(fill => {
      if (fill.name === 'shadycss' && !fill.main) {
        fill.main = 'custom-style-interface';
      }
      return loadScript(bowerMinUrl(name, main, root));
    });
    promises.all(fills).then(() => {
      resolve();
    }).catch(error => reject(error));
  });
});

return polyLoader;

}());
//# sourceMappingURL=poly-loader.js.map
