#!/bin/bash

SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"
REF=$(git rev-parse --verify HEAD)
MSG="Deployed to Github pages: ${REF}"

mkdir -p .gh-pages-tmp
cp demo .gh-pages-tmp/demo
cp docs .gh-pages-tmp
# cp docs .gh-pages-tmp
# TODO: add docs/demo selector ...
echo "reminder::add docs/demo selector"
cd .gh-pages-tmp
git init
git add .
git commit -m "${msg}"

git push -f --quiet "https://github.com/vandeurenglenn/backed" $SOURCE_BRANCH:$TARGET_BRANCH > /dev/null 2>&1
cd ../
