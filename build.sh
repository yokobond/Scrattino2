#!/bin/sh
cd `dirname $0`
rm -R ./dist/
./src/node_modules/.bin/electron-packager ./src Scrattino2 --platform=darwin --arch=x64 --version=0.30.8 --out=dist --icon=icon/scrattino-mac.icns --prune
./src/node_modules/.bin/electron-packager ./src Scrattino2 --platform=win32 --arch=x64 --version=0.30.8 --out=dist --prune
