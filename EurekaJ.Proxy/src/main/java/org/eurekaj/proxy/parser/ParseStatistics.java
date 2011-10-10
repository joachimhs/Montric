/**
    EurekaJ Profiler - http://eurekaj.haagen.name
    
    Copyright (C) 2010-2011 Joachim Haagen Skeie

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
package org.eurekaj.proxy.parser;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.api.enumtypes.ValueType;
import org.eurekaj.proxy.StoreIncomingStatisticsElement;

public class ParseStatistics {
	private static final Logger log = Logger.getLogger(ParseStatistics.class);
	private static String DELIMETER = ";";
	
    public static String parseBtraceFile(File file) throws IOException {
        ParseStatistics parser = new ParseStatistics();
		List<StoreIncomingStatisticsElement> statElemList = new ArrayList<StoreIncomingStatisticsElement>();

		BufferedReader inStream = new BufferedReader(new FileReader(file));
		String line = inStream.readLine();
		while (line != null) {
			//Trim away start and end square brackets.
			if (line.startsWith("[") && line.endsWith("]")) {
	    		line = line.substring(1, line.length()-1);
	    	} else {
	    		//If line does not start and end with square brackets, ignore line
	    		line = inStream.readLine();
	    		continue;
	    	}


			if (line.startsWith("Value;")) {
	    		line = line.substring("Value;".length());
	    		statElemList.addAll(parser.processValueInstrumentation(line));
	    	} else if (line.startsWith("HeapMemory;" )) {
	    		line = line.substring("HeapMemory;".length());
	    		statElemList.addAll(parser.processHeapMemory(line));
	    	} else if(line.startsWith("NonHeapMemory;")) {
	    		line = line.substring("NonHeapMemory;".length());
	    		statElemList.addAll(parser.processNonHeapMemory(line));
	    	} else if (line.startsWith("MemoryPool;")) {
	    		line = line.substring("MemoryPool;".length());
	    		statElemList.addAll(parser.processMemoryPool(line));
	    	} else if(line.startsWith("Threads;")) {
	    		line = line.substring("Threads;".length());
	    		statElemList.addAll(parser.processThreads(line));
	    	} else if (line.startsWith("GCTime;")) {
	    		line = line.substring("GCTime;".length());
	    		statElemList.addAll(parser.processGCTime(line));
	    	} else if (line.startsWith("ProfilingV1;")) {
	    		line = line.substring("ProfilingV1;".length());
	    		statElemList.addAll(parser.processBtraceProfiling(line));
	    	}

	    	line = inStream.readLine();
		}


        StringBuilder jsonBuilder = new StringBuilder();
        jsonBuilder.append("{ \"storeLiveStatistics\": [");
        for (int index = 0; index < statElemList.size() - 1; index++) {
            StoreIncomingStatisticsElement element = statElemList.get(index);
            jsonBuilder.append("{ ");
            jsonBuilder.append("\"guiPath\": \"" + element.getGuiPath() + "\", ");
            jsonBuilder.append("\"timeperiod\": " + element.getTimeperiod() + ", ");
            jsonBuilder.append("\"value\": \"" + element.getValue() + "\", ");
            jsonBuilder.append("\"valueType\": \"" + element.getValueType() + "\", ");
            jsonBuilder.append("\"unitType\": \"" + element.getUnitType() + "\"");
            jsonBuilder.append("}, ");
        }

        //Last element
        if (statElemList.size() > 0) {
            StoreIncomingStatisticsElement element = statElemList.get(statElemList.size() - 1);
            jsonBuilder.append("{ ");
            jsonBuilder.append("\"guiPath\": \"" + element.getGuiPath() + "\", ");
            jsonBuilder.append("\"timeperiod\": " + element.getTimeperiod() + ", ");
            jsonBuilder.append("\"value\": \"" + element.getValue() + "\", ");
            jsonBuilder.append("\"valueType\": \"" + element.getValueType() + "\", ");
            jsonBuilder.append("\"unitType\": \"" + element.getUnitType() + "\"");
            jsonBuilder.append("}");
        }
        jsonBuilder.append("] }");
		return jsonBuilder.toString();
	}
	
	public List<StoreIncomingStatisticsElement> processBtraceProfiling(String line) {
		List<StoreIncomingStatisticsElement> statList = new ArrayList<StoreIncomingStatisticsElement>();
		//agentname package.Class method timeperiod exectime guiPath
		String[] params = line.split(DELIMETER);
		String agentName;
		String className;
		String methodName;
		Long timeperiod;
		String invocations;
		String totalSelftime;
		String avgSelftime;
		String minSelftime;
		String maxSelftime;
		String totalWalltime;
		String avgWalltime;
		String minWalltime;
		String maxWalltime;
        String guiPath = null;

        if (params.length >= 13 && !line.contains("N/A")) {
            if (params.length == 13) {
                guiPath = "Custom";
            }
            if (params.length == 14) {
                guiPath = params[13];
            }

            if (guiPath != null && guiPath.length() > 0) {
                agentName = params[0];
                className = params[1];
                methodName = params[2];
                String timestampStr = params[3];
                timeperiod = 0l;
                try {
                    timeperiod = Long.parseLong(timestampStr);
                    timeperiod = ((long)(timeperiod / 15000));
                } catch (NumberFormatException nfe) {
                    log.error("Unable to read in timestamp");
                }

                invocations = params[4];
                totalSelftime = params[5];
                avgSelftime = params[6];
                minSelftime = params[7];
                maxSelftime = params[8];
                totalWalltime = params[9];
                avgWalltime = params[10];
                minWalltime = params[11];
                maxWalltime = params[12];


                StringBuilder sb = new StringBuilder();
                sb.append(agentName).
                append(":").
                append(guiPath).
                append(":").
                append(className).
                append(":").
                append(methodName);

                StoreIncomingStatisticsElement statElem = new StoreIncomingStatisticsElement();
                statElem.setGuiPath(sb.toString() + ":Calls Per Interval");
                statElem.setTimeperiod(timeperiod);
                statElem.setValue(invocations);
                statElem.setUnitType(UnitType.N.value());
                statElem.setValueType(ValueType.AGGREGATE.value());
                statList.add(statElem);

                StoreIncomingStatisticsElement statElem2 = new StoreIncomingStatisticsElement();
                statElem2.setGuiPath(sb.toString() + ":Total Selftime");
                statElem2.setTimeperiod(timeperiod);
                statElem2.setValue(totalSelftime);
                statElem2.setUnitType(UnitType.NS.value());
                statElem2.setValueType(ValueType.AGGREGATE.value());
                statList.add(statElem2);

                StoreIncomingStatisticsElement statElem3 = new StoreIncomingStatisticsElement();
                statElem3.setGuiPath(sb.toString() + ":Average Selftime");
                statElem3.setTimeperiod(timeperiod);
                statElem3.setValue(avgSelftime);
                statElem3.setUnitType(UnitType.NS.value());
                statElem3.setValueType(ValueType.AVERAGE.value());
                statList.add(statElem3);

                StoreIncomingStatisticsElement statElem4 = new StoreIncomingStatisticsElement();
                statElem4.setGuiPath(sb.toString() + ":Max Selftime");
                statElem4.setTimeperiod(timeperiod);
                statElem4.setValue(maxSelftime);
                statElem4.setUnitType(UnitType.NS.value());
                statElem4.setValueType(ValueType.VALUE.value());
                statList.add(statElem4);

                StoreIncomingStatisticsElement statElem5 = new StoreIncomingStatisticsElement();
                statElem5.setGuiPath(sb.toString() + ":Min Selftime");
                statElem5.setTimeperiod(timeperiod);
                statElem5.setValue(minSelftime);
                statElem5.setUnitType(UnitType.NS.value());
                statElem5.setValueType(ValueType.VALUE.value());
                statList.add(statElem5);

                StoreIncomingStatisticsElement statElem6 = new StoreIncomingStatisticsElement();
                statElem6.setGuiPath(sb.toString() + ":Total Walltime");
                statElem6.setTimeperiod(timeperiod);
                statElem6.setValue(totalWalltime);
                statElem6.setUnitType(UnitType.NS.value());
                statElem6.setValueType(ValueType.AGGREGATE.value());
                statList.add(statElem6);

                StoreIncomingStatisticsElement statElem7 = new StoreIncomingStatisticsElement();
                statElem7.setGuiPath(sb.toString() + ":Avgerage Walltime");
                statElem7.setTimeperiod(timeperiod);
                statElem7.setValue(avgWalltime);
                statElem7.setUnitType(UnitType.NS.value());
                statElem7.setValueType(ValueType.AVERAGE.value());
                statList.add(statElem7);

                StoreIncomingStatisticsElement statElem8 = new StoreIncomingStatisticsElement();
                statElem8.setGuiPath(sb.toString() + ":Max Walltime");
                statElem8.setTimeperiod(timeperiod);
                statElem8.setValue(maxWalltime);
                statElem8.setUnitType(UnitType.NS.value());
                statElem8.setValueType(ValueType.VALUE.value());
                statList.add(statElem8);

                StoreIncomingStatisticsElement statElem9 = new StoreIncomingStatisticsElement();
                statElem9.setGuiPath(sb.toString() + ":Min Walltime");
                statElem9.setTimeperiod(timeperiod);
                statElem9.setValue(minWalltime);
                statElem9.setUnitType(UnitType.NS.value());
                statElem9.setValueType(ValueType.VALUE.value());
                statList.add(statElem9);
            }
        }
		return statList;
	}

    private UnitType getUnitType(String param) {
        UnitType unitType = UnitType.N;

        if (param.equalsIgnoreCase("n")) {
            unitType = UnitType.N;
        } else if (param.equalsIgnoreCase("ns")) {
            unitType = UnitType.NS;
        } else if (param.equalsIgnoreCase("ms")) {
            unitType = UnitType.MS;
        } else if (param.equalsIgnoreCase("s")) {
            unitType = UnitType.S;
        }

        return unitType;
    }

    private ValueType getValueType(String param) {
        ValueType valueType = ValueType.VALUE;

        if (param.equalsIgnoreCase("value")) {
            valueType = ValueType.VALUE;
        } else if (param.equalsIgnoreCase("aggregate")) {
            valueType = ValueType.AGGREGATE;
        } else if (param.equalsIgnoreCase("average")) {
            valueType = ValueType.AVERAGE;
        }

        return valueType;
    }

    public List<StoreIncomingStatisticsElement> processValueInstrumentation(String line) {
		List<StoreIncomingStatisticsElement> statList = new ArrayList<StoreIncomingStatisticsElement>();
		
		String[] params = line.split(DELIMETER);
		if (params.length == 7) {
			
			String agentName = params[0];
			String guiPath = params[1];
			String path = params[2].replaceAll("_", " ");
			String value = params[3];
			Long timeperiod;
            UnitType unitType = getUnitType(params[4]);
            ValueType valueType = getValueType(params[5]);



			String timestampStr = params[6];
			timeperiod = 0l;
			try {
				timeperiod = Long.parseLong(timestampStr);
				timeperiod = ((long)(timeperiod / 15000));
			} catch (NumberFormatException nfe) {
				log.error("Unable to read in timestamp");
			}
			
			StringBuilder sb = new StringBuilder();
			sb.append(agentName)
				.append(":")
				.append(guiPath)
				.append(":")
			.append(path);
			
			StoreIncomingStatisticsElement statElem = new StoreIncomingStatisticsElement();
			statElem.setGuiPath(sb.toString());
			statElem.setTimeperiod(timeperiod);
			statElem.setValue(value);
            statElem.setValueType(valueType.value());
            statElem.setUnitType((unitType.value()));
			statList.add(statElem);
		}
		return statList;
	}
	
	public List<StoreIncomingStatisticsElement> processHeapMemory(String line) {
		List<StoreIncomingStatisticsElement> statList = new ArrayList<StoreIncomingStatisticsElement>();
		String[] params = line.split(DELIMETER);
		String agentName;
		String maxMem;
		String usedMem;
		String commitedMem;
		String initMem;
		String timestampStr;
		
		if (params.length == 6) {
			agentName = params[0];
			maxMem = params[1];
			usedMem = params[2];
			commitedMem = params[3];
			initMem = params[4];
			timestampStr = params[5];
			Long timeperiod = 0l;
			try {
				timeperiod = Long.parseLong(timestampStr);
				timeperiod = ((long)(timeperiod / 15000)); //Data is stored in 15-second intervals
			} catch (NumberFormatException nfe) {
				log.error("Unable to read in timestamp");
			}

			StoreIncomingStatisticsElement initElem = new StoreIncomingStatisticsElement();
			initElem.setGuiPath(agentName + ":Memory:Heap:Init");
			initElem.setTimeperiod(timeperiod);
			initElem.setValue(initMem);
            initElem.setUnitType(UnitType.N.value());
            initElem.setValueType(ValueType.VALUE.value());
			statList.add(initElem);
			
			StoreIncomingStatisticsElement maxElem = new StoreIncomingStatisticsElement();
			maxElem.setGuiPath(agentName + ":Memory:Heap:Max");
			maxElem.setTimeperiod(timeperiod);
			maxElem.setValue(maxMem);
            maxElem.setUnitType(UnitType.N.value());
            maxElem.setValueType(ValueType.VALUE.value());
			statList.add(maxElem);
			
			StoreIncomingStatisticsElement usedElem = new StoreIncomingStatisticsElement();
			usedElem.setGuiPath(agentName + ":Memory:Heap:Used");
			usedElem.setTimeperiod(timeperiod);
			usedElem.setValue(usedMem);
            usedElem.setUnitType(UnitType.N.value());
            usedElem.setValueType(ValueType.VALUE.value());
			statList.add(usedElem);
			
			StoreIncomingStatisticsElement commitedElem = new StoreIncomingStatisticsElement();
			commitedElem.setGuiPath(agentName + ":Memory:Heap:Committed");
			commitedElem.setTimeperiod(timeperiod);
			commitedElem.setValue(commitedMem);
            commitedElem.setUnitType(UnitType.N.value());
            commitedElem.setValueType(ValueType.VALUE.value());
			statList.add(commitedElem);
			
		}
		return statList;
	}
	
	public void processLogTrace(String trace) {
		List<StoreIncomingStatisticsElement> statList = new ArrayList<StoreIncomingStatisticsElement>();
		
		int firstSemiColon = trace.indexOf(";");
		String agentName = trace.substring(0, firstSemiColon);
		String logTrace = trace.substring((firstSemiColon + 1), trace.length());
		
		firstSemiColon = logTrace.indexOf(";");
		String millisStr = logTrace.substring(0, firstSemiColon);
		Long millisecond = 0l;
		try {
			millisecond = Long.parseLong(millisStr);
		} catch (NumberFormatException nfe) {
			nfe.printStackTrace();
		}
		
		logTrace = logTrace.substring((firstSemiColon + 1), trace.length());
		
		//logService.storeLog(agentName, millisecond, logTrace);
	}
	
	public List<StoreIncomingStatisticsElement> processNonHeapMemory(String line) {
		List<StoreIncomingStatisticsElement> statList = new ArrayList<StoreIncomingStatisticsElement>();
		String[] params = line.split(DELIMETER);
		String agentName;
		String maxMem;
		String usedMem;
		String commitedMem;
		String initMem;
		String timestampStr;
		
		if (params.length == 6) {
			agentName = params[0];
			maxMem = params[1];
			usedMem = params[2];
			commitedMem = params[3];
			initMem = params[4];
			timestampStr = params[5];
			Long timeperiod = 0l;
			try {
				timeperiod = Long.parseLong(timestampStr);
				timeperiod = ((long)(timeperiod / 15000)); //Round down to nearest 15 second period 00, 15, 30, 45
			} catch (NumberFormatException nfe) {
				log.error("Unable to read in timestamp");
			}

			StoreIncomingStatisticsElement initElem = new StoreIncomingStatisticsElement();
			initElem.setGuiPath(agentName + ":Memory:NonHeap:Init");
			initElem.setTimeperiod(timeperiod);
			initElem.setValue(initMem);
            initElem.setUnitType(UnitType.N.value());
            initElem.setValueType(ValueType.VALUE.value());
			statList.add(initElem);
			
			StoreIncomingStatisticsElement maxElem = new StoreIncomingStatisticsElement();
			maxElem.setGuiPath(agentName + ":Memory:NonHeap:Max");
			maxElem.setTimeperiod(timeperiod);
			maxElem.setValue(maxMem);
            maxElem.setUnitType(UnitType.N.value());
            maxElem.setValueType(ValueType.VALUE.value());
			statList.add(maxElem);
			
			StoreIncomingStatisticsElement usedElem = new StoreIncomingStatisticsElement();
			usedElem.setGuiPath(agentName + ":Memory:NonHeap:Used");
			usedElem.setTimeperiod(timeperiod);
			usedElem.setValue(usedMem);
            usedElem.setUnitType(UnitType.N.value());
            usedElem.setValueType(ValueType.VALUE.value());
			statList.add(usedElem);
			
			StoreIncomingStatisticsElement commitedElem = new StoreIncomingStatisticsElement();
			commitedElem.setGuiPath(agentName + ":Memory:NonHeap:Committed");
			commitedElem.setTimeperiod(timeperiod);
			commitedElem.setValue(commitedMem);
            commitedElem.setUnitType(UnitType.N.value());
            commitedElem.setValueType(ValueType.VALUE.value());
			statList.add(commitedElem);
		}
		return statList;
	}
	
	public List<StoreIncomingStatisticsElement> processThreads(String line) {
		List<StoreIncomingStatisticsElement> statList = new ArrayList<StoreIncomingStatisticsElement>();
		
		String[] params = line.split(DELIMETER);
		String agentName;
		String threadCount;
		String peakThreadCount;
		String totatStartedThreads;
		String timestampStr;
		
		if (params.length == 5) {
			agentName = params[0];
			threadCount = params[1];
			peakThreadCount = params[2];
			totatStartedThreads = params[3];
			timestampStr = params[4];
			Long timeperiod = 0l;
			try {
				timeperiod = Long.parseLong(timestampStr);
				timeperiod = ((long)(timeperiod / 15000)); //Round down to nearest 15 second period 00, 15, 30, 45
			} catch (NumberFormatException nfe) {
				log.error("Unable to read in timestamp");
			}

			StoreIncomingStatisticsElement maxElem = new StoreIncomingStatisticsElement();
			maxElem.setGuiPath(agentName + ":Threads:ThreadCount");
			maxElem.setTimeperiod(timeperiod);
			maxElem.setValue(threadCount);
            maxElem.setUnitType(UnitType.N.value());
            maxElem.setValueType(ValueType.VALUE.value());
			statList.add(maxElem);
			
			StoreIncomingStatisticsElement usedElem = new StoreIncomingStatisticsElement();
			usedElem.setGuiPath(agentName + ":Threads:PeakThreadCount");
			usedElem.setTimeperiod(timeperiod);
			usedElem.setValue(peakThreadCount);
            usedElem.setUnitType(UnitType.N.value());
            usedElem.setValueType(ValueType.VALUE.value());
			statList.add(usedElem);
			
			StoreIncomingStatisticsElement commitedElem = new StoreIncomingStatisticsElement();
			commitedElem.setGuiPath(agentName + ":Threads:TotalStartedThreads");
			commitedElem.setTimeperiod(timeperiod);
			commitedElem.setValue(totatStartedThreads);
            commitedElem.setUnitType(UnitType.N.value());
            commitedElem.setValueType(ValueType.VALUE.value());
			statList.add(commitedElem);
		}
		return statList;
	}
	
	public List<StoreIncomingStatisticsElement> processThreadsLiveByType(String line) {
		List<StoreIncomingStatisticsElement> statList = new ArrayList<StoreIncomingStatisticsElement>();
		
		//JSFlotAgent;java.lang.Thread;0;1272306420000
		String[] params = line.split(DELIMETER);
		String agentName;
		String threadname;
		String threadCount;
		String timestampStr;
		
		if (params.length == 4) {
			agentName = params[0];
			threadname = params[1];
			threadCount = params[2];
			timestampStr = params[3];
			Long timeperiod = 0l;
			try {
				timeperiod = Long.parseLong(timestampStr);
				timeperiod = ((long)(timeperiod / 15000)); //Round down to nearest 15 second period 00, 15, 30, 45
			} catch (NumberFormatException nfe) {
				log.error("Unable to read in timestamp");
			}

			StringBuilder sb = new StringBuilder();
			sb.append(agentName).append(":Threads:").append(threadname).append(":ThreadCount");
			
			StoreIncomingStatisticsElement maxElem = new StoreIncomingStatisticsElement();
			maxElem.setGuiPath(sb.toString());
			maxElem.setTimeperiod(timeperiod);
			maxElem.setValue(threadCount);
            maxElem.setUnitType(UnitType.N.value());
            maxElem.setValueType(ValueType.VALUE.value());
			statList.add(maxElem);
		}
		return statList;
	}
	
	public List<StoreIncomingStatisticsElement> processMemoryPool(String line) {
		List<StoreIncomingStatisticsElement> statList = new ArrayList<StoreIncomingStatisticsElement>();
		
		String[] params = line.split(DELIMETER);
		String agentName;
		String name;
		String maxMem;
		String usedMem;
		String commitedMem;
		String initMem;
		String timestampStr;

		if (params.length == 7) {
			agentName = params[0];
			name = params[1].replaceAll("_", " ");
			maxMem = params[2];
			usedMem = params[3];
			commitedMem = params[4];
			initMem = params[5];			
			timestampStr = params[6];
			Long timeperiod = 0l;
			try {
				timeperiod = Long.parseLong(timestampStr);
				timeperiod = ((long)(timeperiod / 15000)); //Round down to nearest 15 second period 00, 15, 30, 45
			} catch (NumberFormatException nfe) {
				log.error("Unable to read in timestamp");
			}
			
			StoreIncomingStatisticsElement initElem = new StoreIncomingStatisticsElement();
			initElem.setGuiPath(agentName + ":Memory:MemoryPool:" + name + ":Init");
			initElem.setTimeperiod(timeperiod);
			initElem.setValue(initMem);
            initElem.setUnitType(UnitType.N.value());
            initElem.setValueType(ValueType.VALUE.value());
			statList.add(initElem);
			
			StoreIncomingStatisticsElement maxElem = new StoreIncomingStatisticsElement();
			maxElem.setGuiPath(agentName + ":Memory:MemoryPool:" + name + ":Max");
			maxElem.setTimeperiod(timeperiod);
			maxElem.setValue(maxMem);
            maxElem.setUnitType(UnitType.N.value());
            maxElem.setValueType(ValueType.VALUE.value());
			statList.add(maxElem);
			
			StoreIncomingStatisticsElement usedElem = new StoreIncomingStatisticsElement();
			usedElem.setGuiPath(agentName + ":Memory:MemoryPool:" + name + ":Used");
			usedElem.setTimeperiod(timeperiod);
			usedElem.setValue(usedMem);
            usedElem.setUnitType(UnitType.N.value());
            usedElem.setValueType(ValueType.VALUE.value());
			statList.add(usedElem);
			
			StoreIncomingStatisticsElement commitedElem = new StoreIncomingStatisticsElement();
			commitedElem.setGuiPath(agentName + ":Memory:MemoryPool:" + name + ":Committed");
			commitedElem.setTimeperiod(timeperiod);
			commitedElem.setValue(commitedMem);
            commitedElem.setUnitType(UnitType.N.value());
            commitedElem.setValueType(ValueType.VALUE.value());
			statList.add(commitedElem);
		}
		return statList;
	}
	
	public List<StoreIncomingStatisticsElement> processGCTime(String line) {
		List<StoreIncomingStatisticsElement> statList = new ArrayList<StoreIncomingStatisticsElement>();
		
		String[] params = line.split(DELIMETER);
		String agentName;
		//String gcCountStr;
		String gcTimeStr;
		//String msTimeStr;
		String timestampStr;
		if (params.length == 3) {
			agentName = params[0];
			//gcCountStr = params[1];
			gcTimeStr = params[1];
			//msTimeStr = params[3];
			timestampStr = params[2];
			Long timeperiod = 0l;
			try {
				timeperiod = Long.parseLong(timestampStr);
				timeperiod = ((long)(timeperiod / 15000)); //Round down to nearest 15 second period 00, 15, 30, 45
			} catch (NumberFormatException nfe) {
				log.error("Unable to read in timestamp");
			}
			
			
			StoreIncomingStatisticsElement commitedElem = new StoreIncomingStatisticsElement();
			commitedElem.setGuiPath(agentName + ":Memory:GC:Time Spent In GC(%)");
			commitedElem.setTimeperiod(timeperiod);
			commitedElem.setUnitType(UnitType.N.value());
            commitedElem.setValueType(ValueType.VALUE.value());
			statList.add(commitedElem);
		}
		return statList;
	}

	/*public void processCallStacktrace(String line) {
		String[] traces = line.split(";");
		if (traces.length > 1) {
			String[] headParams = traces[0].split(" ");
			if (headParams.length == 8) {
				Long headId = null;

				String threadName = headParams[0];
				String agentName = headParams[1];
				String classType = headParams[2];
				String path = headParams[3];
				String className = headParams[4];
				String methodName = headParams[5];
				String startTimestamp = headParams[6];
				String stopTimestamp = headParams[7];
				
				StringBuilder sb = new StringBuilder();
				sb.append(agentName).
				append(":").
				append(classType).
				append(":").
				append(path).
				append(":").
				append(className).
				append(":").
				append(methodName);
				
				try {
					headId = statisticsDao.storeCallTraceHead(1L, threadName, Long.parseLong(startTimestamp), Long.parseLong(stopTimestamp), agentName, sb.toString());
					log.debug("headID: " + headId);
				} catch (NumberFormatException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (SQLException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

				if (headId != null) {
					List<CallTraceRow> rowList = new ArrayList<CallTraceRow>();
					for (int i = 1; i < traces.length; i++) {
						String[] params = traces[i].split(" ");
						if (params.length == 5) {
							try {
								log.debug("TraceRow: " + traces[i]);
								rowList.add(new CallTraceRow(headId, params[0], params[1], Long.parseLong(params[2]), params[3], Integer.parseInt(params[4])));
								//statisticsDao.storeCallTraceRow(headId, params[0], params[1], Long.parseLong(params[2]), params[3], Integer.parseInt(params[4]));
								//Long headid, String packageAndClassname, String methodName, Long timestamp, String execTime, int callTraceLevel
							} catch (NumberFormatException e) {
								// TODO Auto-generated catch block
								e.printStackTrace();
							}
						}
					}
					
					try {
						statisticsDao.storeCallTraceRows(rowList);
					} catch (SQLException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
			}
		}
	}*/
}

