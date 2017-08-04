#!/bin/sh
# create a backup of everything that changes temporary
username=`git config user.name`
echo $username

# change username to auto releaser
git config --global user.name "AutoRelease" --replace-all

# Version key/value should be on his own line
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

echo $PACKAGE_VERSION
git add package.json
git add dist/**
git commit -m ":trollface: Version: $PACKAGE_VERSION"

hash=`git log -1 --pretty=%P`

git tag $PACKAGE_VERSION

git reset $hash

# change username back
git config --global user.name "$username" --replace-all

git push origin $PACKAGE_VERSION

echo removing release files
rm -rf dist
