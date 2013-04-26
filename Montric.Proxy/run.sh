#!/bin/bash

#This script is used to run EurekaJ Proxy on EC2: http://haagen.name/2011/05/17/Moving_the_profiling_into_the_cloud.html

workingdir=/srv/eurekajproxy
jarFile=eurekaJ.Proxy-1.1.0-SNAPSHOT-jar-with-dependencies.jar
JAVA_OPTS="-Xmx64m -Xms32m"

#####

currdir=`pwd`
cd $workingdir

nohup java -jar $workingdir/$jarFile > output.txt &