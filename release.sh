#!/bin/sh
# Version key/value should be on his own line
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

echo $PACKAGE_VERSION

uglifyjs dist/backed.js --compress --mangle --keep-fnames --ecma 6 --output dist/backed.min.js
uglifyjs dist/poly-loader.js --compress --mangle --keep-fnames --ecma 6 --output dist/poly-loader.min.js

git add package.json
git add docs
git commit -m ":trollface: Version: $PACKAGE_VERSION"

git tag $PACKAGE_VERSION

git push origin $PACKAGE_VERSION
