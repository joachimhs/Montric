package org.eurekaj.proxy.parser;

import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.eurekaj.webservice.StoreIncomingStatisticsElement;

public class ParseStatistics {
	private static Logger log = Logger.getLogger(ParseStatistics.class);
	private static String DELIMETER = ";";
	
	public List<StoreIncomingStatisticsElement> processProfiling(String line) {
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

        System.out.println("GOT HERE");


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
				System.err.println("Unable to read in timestamp");
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
            statElem.setValueType("n");
			statList.add(statElem);
			
			StoreIncomingStatisticsElement statElem2 = new StoreIncomingStatisticsElement();
			statElem2.setGuiPath(sb.toString() + ":Total Selftime");
			statElem2.setTimeperiod(timeperiod);
			statElem2.setValue(totalSelftime);
            statElem2.setValueType("ns");
			statList.add(statElem2);
			
			StoreIncomingStatisticsElement statElem3 = new StoreIncomingStatisticsElement();
			statElem3.setGuiPath(sb.toString() + ":Average Selftime");
			statElem3.setTimeperiod(timeperiod);
			statElem3.setValue(avgSelftime);
            statElem3.setValueType("ns");
			statList.add(statElem3);
			
			StoreIncomingStatisticsElement statElem4 = new StoreIncomingStatisticsElement();
			statElem4.setGuiPath(sb.toString() + ":Max Selftime");
			statElem4.setTimeperiod(timeperiod);
			statElem4.setValue(maxSelftime);
            statElem4.setValueType("ns");
			statList.add(statElem4);
			
			StoreIncomingStatisticsElement statElem5 = new StoreIncomingStatisticsElement();
			statElem5.setGuiPath(sb.toString() + ":Min Selftime");
			statElem5.setTimeperiod(timeperiod);
			statElem5.setValue(minSelftime);
            statElem5.setValueType("ns");
			statList.add(statElem5);
			
			StoreIncomingStatisticsElement statElem6 = new StoreIncomingStatisticsElement();
			statElem6.setGuiPath(sb.toString() + ":Total Walltime");
			statElem6.setTimeperiod(timeperiod);
			statElem6.setValue(totalWalltime);
            statElem6.setValueType("ns");
			statList.add(statElem6);
			
			StoreIncomingStatisticsElement statElem7 = new StoreIncomingStatisticsElement();
			statElem7.setGuiPath(sb.toString() + ":Avgerage Walltime");
			statElem7.setTimeperiod(timeperiod);
			statElem7.setValue(avgWalltime);
            statElem7.setValueType("ns");
			statList.add(statElem7);
			
			StoreIncomingStatisticsElement statElem8 = new StoreIncomingStatisticsElement();
			statElem8.setGuiPath(sb.toString() + ":Max Walltime");
			statElem8.setTimeperiod(timeperiod);
			statElem8.setValue(maxWalltime);
            statElem8.setValueType("ns");
			statList.add(statElem8);
			
			StoreIncomingStatisticsElement statElem9 = new StoreIncomingStatisticsElement();
			statElem9.setGuiPath(sb.toString() + ":Min Walltime");
			statElem9.setTimeperiod(timeperiod);
			statElem9.setValue(minWalltime);
            statElem9.setValueType("ns");
			statList.add(statElem9);
		}
		
		return statList;
	}

    private String getValueType(String param) {
        String valueType = "n";

        if (param.equalsIgnoreCase("n")
                || param.equalsIgnoreCase("ns")
                || param.equalsIgnoreCase("ms")
                || param.equalsIgnoreCase("s")) {

            valueType = param;
        }
        return valueType;
    }

    public List<StoreIncomingStatisticsElement> processValueInstrumentation(String line) {
		List<StoreIncomingStatisticsElement> statList = new ArrayList<StoreIncomingStatisticsElement>();
		
		String[] params = line.split(DELIMETER);
		if (params.length == 5) {
			
			String agentName = params[0];
			String guiPath = params[1];
			String path = params[2].replaceAll("_", " ");
			String value = params[3];
			Long timeperiod;
            String valueType = valueType = getValueType(params[4]);


			String timestampStr = params[5];
			timeperiod = 0l;
			try {
				timeperiod = Long.parseLong(timestampStr);
				timeperiod = ((long)(timeperiod / 15000));
			} catch (NumberFormatException nfe) {
				System.err.println("Unable to read in timestamp");
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
            statElem.setValueType(valueType);
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
				System.err.println("Unable to read in timestamp");
			}

			StoreIncomingStatisticsElement initElem = new StoreIncomingStatisticsElement();
			initElem.setGuiPath(agentName + ":Memory:Heap:Init");
			initElem.setTimeperiod(timeperiod);
			initElem.setValue(initMem);
            initElem.setValueType("n");
			statList.add(initElem);
			
			StoreIncomingStatisticsElement maxElem = new StoreIncomingStatisticsElement();
			maxElem.setGuiPath(agentName + ":Memory:Heap:Max");
			maxElem.setTimeperiod(timeperiod);
			maxElem.setValue(maxMem);
            maxElem.setValueType("n");
			statList.add(maxElem);
			
			StoreIncomingStatisticsElement usedElem = new StoreIncomingStatisticsElement();
			usedElem.setGuiPath(agentName + ":Memory:Heap:Used");
			usedElem.setTimeperiod(timeperiod);
			usedElem.setValue(usedMem);
            usedElem.setValueType("n");
			statList.add(usedElem);
			
			StoreIncomingStatisticsElement commitedElem = new StoreIncomingStatisticsElement();
			commitedElem.setGuiPath(agentName + ":Memory:Heap:Committed");
			commitedElem.setTimeperiod(timeperiod);
			commitedElem.setValue(commitedMem);
            commitedElem.setValueType("n");
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
				System.err.println("Unable to read in timestamp");
			}

			StoreIncomingStatisticsElement initElem = new StoreIncomingStatisticsElement();
			initElem.setGuiPath(agentName + ":Memory:NonHeap:Init");
			initElem.setTimeperiod(timeperiod);
			initElem.setValue(initMem);
            initElem.setValueType("n");
			statList.add(initElem);
			
			StoreIncomingStatisticsElement maxElem = new StoreIncomingStatisticsElement();
			maxElem.setGuiPath(agentName + ":Memory:NonHeap:Max");
			maxElem.setTimeperiod(timeperiod);
			maxElem.setValue(maxMem);
            maxElem.setValueType("n");
			statList.add(maxElem);
			
			StoreIncomingStatisticsElement usedElem = new StoreIncomingStatisticsElement();
			usedElem.setGuiPath(agentName + ":Memory:NonHeap:Used");
			usedElem.setTimeperiod(timeperiod);
			usedElem.setValue(usedMem);
            usedElem.setValueType("n");
			statList.add(usedElem);
			
			StoreIncomingStatisticsElement commitedElem = new StoreIncomingStatisticsElement();
			commitedElem.setGuiPath(agentName + ":Memory:NonHeap:Committed");
			commitedElem.setTimeperiod(timeperiod);
			commitedElem.setValue(commitedMem);
            commitedElem.setValueType("n");
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
				System.err.println("Unable to read in timestamp");
			}

			StoreIncomingStatisticsElement maxElem = new StoreIncomingStatisticsElement();
			maxElem.setGuiPath(agentName + ":Threads:ThreadCount");
			maxElem.setTimeperiod(timeperiod);
			maxElem.setValue(threadCount);
            maxElem.setValueType("n");
			statList.add(maxElem);
			
			StoreIncomingStatisticsElement usedElem = new StoreIncomingStatisticsElement();
			usedElem.setGuiPath(agentName + ":Threads:PeakThreadCount");
			usedElem.setTimeperiod(timeperiod);
			usedElem.setValue(peakThreadCount);
            usedElem.setValueType("n");
			statList.add(usedElem);
			
			StoreIncomingStatisticsElement commitedElem = new StoreIncomingStatisticsElement();
			commitedElem.setGuiPath(agentName + ":Threads:TotalStartedThreads");
			commitedElem.setTimeperiod(timeperiod);
			commitedElem.setValue(totatStartedThreads);
            commitedElem.setValueType("n");
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
				System.err.println("Unable to read in timestamp");
			}

			StringBuilder sb = new StringBuilder();
			sb.append(agentName).append(":Threads:").append(threadname).append(":ThreadCount");
			
			StoreIncomingStatisticsElement maxElem = new StoreIncomingStatisticsElement();
			maxElem.setGuiPath(sb.toString());
			maxElem.setTimeperiod(timeperiod);
			maxElem.setValue(threadCount);
            maxElem.setValueType("n");
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
				System.err.println("Unable to read in timestamp");
			}
			
			StoreIncomingStatisticsElement initElem = new StoreIncomingStatisticsElement();
			initElem.setGuiPath(agentName + ":Memory:MemoryPool:" + name + ":Init");
			initElem.setTimeperiod(timeperiod);
			initElem.setValue(initMem);
            initElem.setValueType("n");
			statList.add(initElem);
			
			StoreIncomingStatisticsElement maxElem = new StoreIncomingStatisticsElement();
			maxElem.setGuiPath(agentName + ":Memory:MemoryPool:" + name + ":Max");
			maxElem.setTimeperiod(timeperiod);
			maxElem.setValue(maxMem);
            maxElem.setValueType("n");
			statList.add(maxElem);
			
			StoreIncomingStatisticsElement usedElem = new StoreIncomingStatisticsElement();
			usedElem.setGuiPath(agentName + ":Memory:MemoryPool:" + name + ":Used");
			usedElem.setTimeperiod(timeperiod);
			usedElem.setValue(usedMem);
            usedElem.setValueType("n");
			statList.add(usedElem);
			
			StoreIncomingStatisticsElement commitedElem = new StoreIncomingStatisticsElement();
			commitedElem.setGuiPath(agentName + ":Memory:MemoryPool:" + name + ":Committed");
			commitedElem.setTimeperiod(timeperiod);
			commitedElem.setValue(commitedMem);
            commitedElem.setValueType("n");
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
				System.err.println("Unable to read in timestamp");
			}
			
			
			StoreIncomingStatisticsElement commitedElem = new StoreIncomingStatisticsElement();
			commitedElem.setGuiPath(agentName + ":Memory:GC:Time Spent In GC(%)");
			commitedElem.setTimeperiod(timeperiod);
			commitedElem.setValue(gcTimeStr);
            commitedElem.setValueType("n");
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
					System.out.println("headID: " + headId);
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
								System.out.println("TraceRow: " + traces[i]);
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

