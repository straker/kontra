#!/bin/bash
set -e

# colors
# @see https://stackoverflow.com/a/5947802/2124254
Cyan='\033[0;36m'
NC='\033[0m' # No Color

versions=("major" "minor" "patch")

# https://stackoverflow.com/a/8574392/2124254
containsElement () {
  local e match="$1"
  shift
  for e; do [[ "$e" == "$match" ]] && return 0; done
  return 1
}

# enforce passing an argument
# https://stackoverflow.com/a/22725973/2124254
if (( $# == 0 )) || ( ! containsElement $1 "${versions[@]}" ); then
  echo "usage: sh tasks/release.sh [major | minor | patch]"
  exit 1;
fi

printf "\n${Cyan}Releasing lib${NC}\n"
npm run dist
npm version $1
npm publish

version=$(node -p "require('./package.json').version")

printf "\n${Cyan}Releasing docs${NC}\n"
# rebuild docs to generate download page with newest version
npm run build:docs
cd docs
find . -name "*.html" | cpio -pvd ../tmp &>/dev/null
cp -r assets ../tmp/assets
cd ..
git checkout gh-pages
ls | grep -v tmp | grep -v node_modules | xargs rm -rf
mv tmp/* .
rm -rf tmp
git add .
git commit -m "docs: release $version"
git push origin gh-pages
git checkout main