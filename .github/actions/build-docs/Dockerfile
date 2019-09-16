FROM debian:jessie-slim

LABEL "com.github.actions.name"="Build Docs"
LABEL "com.github.actions.description"="Build docs on pushes to master"
LABEL "com.github.actions.icon"="git"
LABEL "com.github.actions.color"="orange"

COPY build-docs.sh /build-docs.sh

ENTRYPOINT ["sh", "/build-docs.sh"]