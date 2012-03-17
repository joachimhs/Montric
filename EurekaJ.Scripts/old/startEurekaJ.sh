#!/bin/bash

export EUREKAJ_HOME="/home/eurekaj/eurekaj"
workingdir=$EUREKAJ_HOME
app=eurekaJ.managerServer
export JAVA_OPTS="-Xmx3200m -Xms1512m -Djava.io.tmpdir=/jettytmp -Dbtrace.agent=EurekaJAgent -Dlog4j.configuration=file:/home/eurekaj/eurekaj/log4j.xml -javaagent:/home/eurekaj/btrace/1.2/build/btrace-agent.jar=,scriptdir=/home/eurekaj/btrace/1.2/scripts,stdout=false,fileRollMilliseconds=7500"

#####

currdir=`pwd`
cd $workingdir

rm -rf $app
unzip $app.zip > /dev/null
#cd $currdir
#sh $app/bin/$server > /dev/null 2>&1 &
sh $app/bin/run.sh