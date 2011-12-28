#!/bin/bash

timeperiod=$(date +%s)
let timeperiod+=0
let timeperiodstr=timeperiod/15
let timeperiodstr=timeperiodstr*15000

eval totalMem=(`free -b | grep "Mem" | awk '{ print ($2) }'`)
echo "[Value;eurekajdemo.haagen.name;Memory;System:Total;$totalMem;n;value;$timeperiodstr]"

eval usedMem=(`free -b | grep "Mem" | awk '{ print ($3) }'`)
echo "[Value;eurekajdemo.haagen.name;Memory;System:Used;$usedMem;n;value;$timeperiodstr]"

eval freeMem=(`free -b | grep "Mem" | awk '{ print ($4) }'`)
echo "[Value;eurekajdemo.haagen.name;Memory;System:Free;$freeMem;n;value;$timeperiodstr]"
