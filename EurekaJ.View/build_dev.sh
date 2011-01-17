#!/bin/bash

rm -r ../EurekaJ.Manager/src/main/webapp/eurekaJView
rm -r ./build
/usr/local/bin/node /Users/joahaa/Projects/eurekaj/EurekaJ.View/garcon_build.js
cp -R ./build/eurekaJView ../EurekaJ.Manager/src/main/webapp/eurekaJView
