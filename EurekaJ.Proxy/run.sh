#!/bin/bash

#This script is used to run EurekaJ Proxy on EC2: http://haagen.name/2011/05/17/Moving_the_profiling_into_the_cloud.html

workingdir=/home/ec2-user/eurekajproxy
jarFile=eurekaJ.Proxy-1.0-jar-with-dependencies.jar
JAVA_OPTS="-Xmx64m -Xms32m"

#####

currdir=`pwd`
cd $workingdir

nohup java -jar $workingdir/$jarFile /home/ec2-user/btrace/scripts http://localhost:8080/liveStatistics > output.txt &