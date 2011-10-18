#!/bin/bash

#Garcon
#rm -rf ../EurekaJ.Manager/src/main/webapp/eurekaJView
#rm -rf ./build
#/usr/local/bin/node ../EurekaJ.View/garcon_build.js
#cp -R ./build/eurekaJView ../EurekaJ.Manager/src/main/webapp/eurekaJView

#SproutCore build tools
#rm -rf ../EurekaJ.Manager/src/main/webapp/static
rm -rf ./tmp
/usr/bin/sc-build --build eurekajview
#cp -R ./tmp/build/static ../EurekaJ.Manager/src/main/webapp/static

