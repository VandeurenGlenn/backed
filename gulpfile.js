'use strict';
const {task, series, src, dest} = require('gulp');
const del = require('del');
const {rollup} = require('rollup');
const babel = require('rollup-plugin-babel');
const json = require('rollup-plugin-json');
const browserSync = require('browser-sync').create();

const reload = () => {
  return browserSync.reload;
};
let cache;

task('clean', () => {
  return del(['backed.js', 'backed.min.js']);
});

task('browserSync', () => {
	browserSync.init({
    port: 5000,
    ui: {
      port: 5001,
    },
    server: {
      baseDir: ['demo', './'],
      index: 'index.html',
    },
  });
  browserSync.watch('src/**/*.js')
    .on('change', series('rollup', reload()));
});

task('rollup', () => {
  return rollup({
    entry: 'src/index.js',
    // Use the previous bundle as starting point.
    cache: cache,
  }).then((bundle) => {
    // Cache our bundle for later use (optional)
    cache = bundle;

    bundle.write({
      format: 'es',
      sourceMap: true,
      plugins: [
        json(),
        babel(),
      ],
      dest: 'dist/backed.js',
    });
  });
});

// setup build & development tasks
task('build', series('rollup'));
task('default', series('build'));

task('serve', series('build', 'browserSync'));
