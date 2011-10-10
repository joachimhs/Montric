#!/bin/bash

workingdir=/home/ec2-user

mkdir jettytmp
mkdir eurekaj
cd eurekaj
mkdir logs
mkdir EurekaJData
curl -o eurekaJ.managerServer.zip http://nightly.haagen.name/EurekaJ/latest/eurekaJ.ManagerServer-1.0.2.zip
curl -o run.sh https://raw.github.com/joachimhs/EurekaJ/master/EurekaJ.ManagerServer/run.sh
chmod 755 run.sh
curl -o users.properties https://raw.github.com/joachimhs/EurekaJ/master/EurekaJ.ManagerServer/users.properties
curl -o jetty.xml https://raw.github.com/joachimhs/EurekaJ/master/EurekaJ.ManagerServer/jetty.xml
curl -o config.properties https://raw.github.com/joachimhs/EurekaJ/master/EurekaJ.ManagerServer/config.properties