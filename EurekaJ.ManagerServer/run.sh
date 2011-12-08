#!/bin/bash

workingdir=$EUREKAJ_HOME
app=eurekaJ.managerServer
execClass=org.eurekaJ.managerServer.JettyServer
classpathVar=$(find $workingdir/$app/lib -name '*.jar' -exec printf :{} ';')$(find $workingdir/$app/webapp -name '*.war' -exec printf :{} ';')$(find $workingdir/$app/plugins -name '*.jar' -exec printf :{} ';')$(find $workingdir/plugins -name '*.jar' -exec printf :{} ';')

#Start EurekaJ Manager
nohup java $JAVA_OPTS -classpath $classpathVar -Dbasedir=$workingdir/$app $execClass > /dev/null 2>&1 &
