#!/bin/bash

SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"
REF=$(git rev-parse --verify HEAD)
MSG="Deployed to Github pages: ${REF}"

mkdir -p .gh-pages-tmp
mkdir -p .gh-pages-tmp/docs
mkdir -p .gh-pages-tmp/demo
mkdir -p .gh-pages-tmp/src
mkdir -p .gh-pages-tmp/mixins

cp demo/* .gh-pages-tmp/demo -r
cp docs/** .gh-pages-tmp/docs -r
cp src/** .gh-pages-tmp/src -r
cp mixins/** .gh-pages-tmp/mixins -r
cp node_modules/custom-docs/custom-docs.js .gh-pages-tmp/custom-docs.js
cp node_modules/custom-docs/src/ .gh-pages-tmp/src/ -r
cp node_modules/custom-docs/index.html .gh-pages-tmp/index.html
# cp docs/**/** .gh-pages-tmp
# cp docs .gh-pages-tmp
# TODO: add docs/demo selector ...
echo "reminder::add docs/demo selector"
cd .gh-pages-tmp
git init
git add .
git commit -m "${MSG}"

git push -f "https://github.com/vandeurenglenn/backed" $SOURCE_BRANCH:$TARGET_BRANCH > /dev/null 2>&1
cd ../
