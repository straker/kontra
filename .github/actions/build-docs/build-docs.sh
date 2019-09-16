#!/bin/sh
set -e

sh -c "npm install \
      npm run buid:docs"

sh -c "git config --global user.name 'straker' \
      && git config --global user.email 'stevenlambert503@gmail.com' \
      && git add -A && git commit -m '$*' --allow-empty \
      && git push -u origin HEAD"