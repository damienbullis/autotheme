#!/bin/bash

OS=$(uname | tr '[:upper:]' '[:lower:]')

case "$OS" in
  linux*)
    ./autotheme-linux-amd64
    ;;
  darwin*)
    ./autotheme-darwin-amd64
    ;;
  msys*)
    ./autotheme-windows-amd64.exe
    ;;
  *)
    echo "Unsupported OS: $OS"
    exit 1
    ;;
esac
