#!/bin/bash

timeperiod=$(date +%s)
let timeperiod+=0
let timeperiodstr=timeperiod/15
let timeperiodstr=timeperiodstr*15000

eval cpuIdle=(`vmstat | grep -v swpd | awk '{print $15}'`)
#eval cpuIdle=(`top -n 1 | grep Cpu | awk '{print $5}' | cut -d '.' -f 1`)
echo "[Value;eurekajdemo.haagen.name;CPU;System:Idle;$cpuIdle;n;value;$timeperiodstr]"