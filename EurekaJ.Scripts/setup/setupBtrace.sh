#!/bin/bash

mkdir btrace 
cd btrace
mkdir 1.2
cd 1.2
mkdir scripts

curl -o btrace-bin.zip http://kenai.com/downloads/btrace/releases/release-1.2/btrace-bin.zip
unzip btrace-bin.zip > /dev/null