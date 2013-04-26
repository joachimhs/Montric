#!/bin/bash

timeperiod=$(date +%s)
let timeperiod+=0
let timeperiodstr=timeperiod/15
let timeperiodstr=timeperiodstr*15000

eval percentageArray=(`df -h | grep -vE "^Filesystem|shm|boot" | awk '{ print ($6 ":Percent_Used___" ":Percent_Used___" +$5) }'`)

for percent in "${percentageArray[@]}"
do
	#echo $percent
	match="___"
	repl=";"
	echo "[Value;eurekajdemo.haagen.name;Disk;${percent//$match/$repl};n;value;$timeperiodstr]"
done
