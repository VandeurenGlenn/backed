#!/bin/sh

echo 'cleaning ...'

node scripts/clean.js

rm -rf .gh-pages-tmp
rm -rf backed.js
rm -rf backed.min.js
rm -rf backed.js.map
rm -rf poly-loader.js
rm -rf poly-loader.min.js
rm -rf poly-loader.js.map
rm -rf mixins
