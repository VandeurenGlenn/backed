#!/bin/sh
# create a backup of everything that changes temporary
username=`git config user.name`
echo $username

# change username to auto releaser
git config --global user.name "AutoRelease" --replace-all

# get value
value=`cat dist/backed.js`

# write value
echo '<script>'$value'' > backed.html

# fix mappingURL & add end script tag
sed -i 's/\/\/\# sourceMappingURL=backed.js.map/<\/script>\/\/\# sourceMappingURL=dist\/backed.js.map/' backed.html

# Version key/value should be on his own line
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

echo $PACKAGE_VERSION
git add package.json
git add backed.html
git add dist/**
git commit -m ":trollface: Version: $PACKAGE_VERSION"

hash=`git log -1 --pretty=%P`

git tag $PACKAGE_VERSION

git reset $hash

# change username back
git config --global user.name "$username" --replace-all

git push origin $PACKAGE_VERSION
