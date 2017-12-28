const {readFile, writeFile} = require('fs');

const set = ['src/mixins/lit-mixin.js', 'src/base.js', 'src/backed.js'];

const transform = (dest, data) => {
  writeFile(dest, data.replace('node_modules/lit', '../lit'), (error) => {
    if (error) console.error(error);
  });
};

for (const path of set) {
  readFile(path, 'utf8', (error, data) => {
    if (error) console.error(error);
    else transform(path, data);
  });
}
