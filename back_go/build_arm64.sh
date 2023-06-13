#!/bin/bash

read -e -p "(Re)build frontend? [Y/N] " REPLY

if [[ $REPLY =~ ^[Yy]$ ]]; then
  SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
  ROOT_DIR=$(dirname "$SCRIPT_DIR")
  FRONT="$ROOT_DIR/front"

  pushd "$FRONT" || exit 1
  npm ci
  npm run build
  popd || exit 1

  mkdir -p "$SCRIPT_DIR/dist"
  rm -rf "$SCRIPT_DIR/dist/*"
  cp -R "$FRONT/dist/"* "$SCRIPT_DIR/dist"
fi

export CC=aarch64-linux-gnu-gcc
GOOS=linux GOARCH=arm64 go build .
/usr/aarch64-linux-gnu/bin/strip untamo_server.zzz
upx untamo_server.zzz