#!/bin/sh
# Version key/value should be on his own line
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

echo $PACKAGE_VERSION

node scripts/build.js

uglifyjs backed.js --compress --mangle --keep-fnames --ecma 6 --output backed.min.js
uglifyjs mixins/lit-mixin.js --compress --mangle --keep-fnames --ecma 6 --output mixins/lit-mixin.min.js
uglifyjs mixins/property-mixin.js --compress --mangle --keep-fnames --ecma 6 --output mixins/property-mixin.min.js
uglifyjs poly-loader.js --compress --mangle --keep-fnames --ecma 6 --output poly-loader.min.js

git add package.json
git add yarn.lock
git add docs
git add src/*

git commit -m ":trollface: Version: $PACKAGE_VERSION"

git tag $PACKAGE_VERSION

git push origin $PACKAGE_VERSION
