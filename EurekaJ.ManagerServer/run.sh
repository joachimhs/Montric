#!/bin/bash

#This script is used to run EurekaJ on the EC2 instance: http://haagen.name/2011/05/17/Moving_the_profiling_into_the_cloud.html

workingdir=/home/ec2-user/eurekaj
app=eurekaJ.managerServer
server=eurekaJ.ManagerServer
execClass=org.eurekaJ.managerServer.JettyServer
JAVA_OPTS="-Xmx1512m -Xms768m -Djava.io.tmpdir=/tmp -Dbtrace.agent=EurekaJAgent -Dlog4j.configuration=file:/home/ec2-user/eurekaj/log4j.xml -javaagent:/home/ec2-user/btrace/1.2/btrace-agent.jar=,scriptdir=/home/ec2-user/btrace/scripts,stdout=false,fileRollMilliseconds=7500"

#####

currdir=`pwd`
cd $workingdir

rm -rf $app
unzip $app.zip > /dev/null
#cd $currdir
#sh $app/bin/$server > /dev/null 2>&1 &
classpathVar=$(find $workingdir/$app -name '*.jar' -exec printf :{} ';')$(find $workingdir/$app -name '*.war' -exec printf :{} ';')$(find $workingdir/lib -name '*.jar' -exec printf :{} ';')

#Start EurekaJ Manager
nohup java $JAVA_OPTS -classpath $classpathVar -Dbasedir=$workingdir/$app $execClass > /dev/null 2>&1 &