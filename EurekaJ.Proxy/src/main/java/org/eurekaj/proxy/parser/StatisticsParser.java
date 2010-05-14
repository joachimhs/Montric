package org.eurekaj.proxy.parser;

import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.eurekaj.webservice.StoreIncomingStatisticsElement;
import org.eurekaj.webservice.StoreIncomingStatisticsList;

public class StatisticsParser {
	private static Logger log = Logger.getLogger(StatisticsParser.class);
	private static String DELIMETER = ";";

	public List<StoreIncomingStatisticsElement> processExecTime(String line) {
		List<StoreIncomingStatisticsElement> statList = new ArrayList<StoreIncomingStatisticsElement>();
		//agentname package.Class method timeperiod exectime guiPath
		String[] params = line.split(DELIMETER);
		String agentName;
		String className;
		String methodName;
		Long timeperiod;
		String executionTime;
		String guiPath = null;
		if (params.length == 5) {
			guiPath = "Custom";
		}
		if (params.length == 6) {
			guiPath = params[5];
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
			executionTime = params[4];
			
			StringBuilder sb = new StringBuilder();
			sb.append(agentName).
			append(":").
			append(guiPath).
			append(":").
			append(className).
			append(":").
			append(methodName);
			
			StoreIncomingStatisticsElement statElem = new StoreIncomingStatisticsElement();
			statElem.setGuiPath(sb.toString());
			statElem.setTimeperiod(timeperiod);
			statElem.setExecTime(executionTime);
			statElem.setCallsPerInterval(null);
			statElem.setValue(null);
			statList.add(statElem);
		}
		
		return statList;
	}
	
	public List<StoreIncomingStatisticsElement> processCallsPerInterval(String line) {
		List<StoreIncomingStatisticsElement> statList = new ArrayList<StoreIncomingStatisticsElement>();
		//agentname package.Class method timeperiod exectime
		String[] params = line.split(DELIMETER);
		String agentName;
		String className;
		String methodName;
		Long timeperiod;
		String callsPerInterval;
		String guiPath = null;
		if (params.length == 5) {
			guiPath = "Custom";
		}
		if (params.length == 6) {
			guiPath = params[5];
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
			callsPerInterval = params[4];
			
			StringBuilder sb = new StringBuilder();
			sb.append(agentName).
			append(":").
			append(guiPath).
			append(":").
			append(className).
			append(":").
			append(methodName);
			
			StoreIncomingStatisticsElement statElem = new StoreIncomingStatisticsElement();
			statElem.setGuiPath(sb.toString());
			statElem.setTimeperiod(timeperiod);
			statElem.setExecTime(null);
			statElem.setCallsPerInterval(callsPerInterval);
			statElem.setValue(null);
			statList.add(statElem);
		}
		
		return statList;
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
			String timestampStr = params[4];
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
			statElem.setExecTime(null);
			statElem.setCallsPerInterval(null);
			statElem.setValue(value);
			statList.add(statElem);
		}
		return statList;
	}
	
	public List<StoreIncomingStatisticsElement> processClassInstrumentation(String line) {
		List<StoreIncomingStatisticsElement> statList = new ArrayList<StoreIncomingStatisticsElement>();
		log.getAppender("");
		//DefaultAgent org.ajax4jsf.javascript.ImageCacheScript getJavaScript 1236768698235 0 6 Frontends Ajax4JSF
		String[] params = line.split(DELIMETER);
		String agentName;
		String className;
		String methodName;
		String executionTime;
		String callsPerInterval;
		String guiPath;
		String path;
		if (params.length == 8) {
			//AgentName package.name.ClassName method timestamp execTime callsPerInterval Path
			agentName = params[0];
			className = params[1];
			methodName = params[2];
			String timestampStr = params[3];
			Long timeperiod = 0l;
			try {
				timeperiod = Long.parseLong(timestampStr);
				timeperiod = ((long)(timeperiod / 15000));
			} catch (NumberFormatException nfe) {
				System.err.println("Unable to read in timestamp");
			}
			executionTime = params[4];
			callsPerInterval = params[5];
			guiPath = params[6];
			path = params[7];
			if (path == null || path.equals("null") || path.equals("")) {
				path = "Custom";
			}
			
			StringBuilder sb = new StringBuilder();
			sb.append(agentName).
			append(":").
			append(guiPath).
			append(":").
			append(path).
			append(":").
			append(className).
			append(":").
			append(methodName);
			
			StoreIncomingStatisticsElement statElem = new StoreIncomingStatisticsElement();
			statElem.setGuiPath(sb.toString());
			statElem.setTimeperiod(timeperiod);
			statElem.setExecTime(executionTime);
			statElem.setCallsPerInterval(callsPerInterval);
			statElem.setValue(null);
			statList.add(statElem);		
			
			//System.out.println("Class: " +  className + ", Method: " + methodName + ", Timestamp: " + timestamp + ", ExecTime: " + executionTime);
		}
		
		return statList;
	}
	
	public List<StoreIncomingStatisticsElement> processGroupInstumentation(String line) {
		
		List<StoreIncomingStatisticsElement> statList = new ArrayList<StoreIncomingStatisticsElement>();
		String[] params = line.split(DELIMETER);
		String agentName;
		String groupName;
		Long timeperiod;
		String execTime;
		String callsPerInterval;
		String guiPath;
		
		if (params.length == 6) {
			agentName = params[0];
			groupName = params[1];
			String timestampStr = params[2];
			timeperiod = 0l;
			try {
				timeperiod = Long.parseLong(timestampStr);
				timeperiod = ((long)(timeperiod / 15000)); //Round down to nearest 15 second period 00, 15, 30, 45
			} catch (NumberFormatException nfe) {
				System.err.println("Unable to read in timestamp");
			}
			execTime = params[3];
			callsPerInterval = params[4];
			guiPath = params[5];
			
			StoreIncomingStatisticsElement statElem = new StoreIncomingStatisticsElement();
			statElem.setGuiPath(agentName + ":" + groupName);
			statElem.setTimeperiod(timeperiod);
			statElem.setExecTime(execTime);
			statElem.setCallsPerInterval(callsPerInterval);
			statElem.setValue(null);
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
			initElem.setExecTime(null);
			initElem.setCallsPerInterval(null);
			initElem.setValue(initMem);
			statList.add(initElem);
			
			StoreIncomingStatisticsElement maxElem = new StoreIncomingStatisticsElement();
			maxElem.setGuiPath(agentName + ":Memory:Heap:Max");
			maxElem.setTimeperiod(timeperiod);
			maxElem.setExecTime(null);
			maxElem.setCallsPerInterval(null);
			maxElem.setValue(maxMem);
			statList.add(maxElem);
			
			StoreIncomingStatisticsElement usedElem = new StoreIncomingStatisticsElement();
			usedElem.setGuiPath(agentName + ":Memory:Heap:Used");
			usedElem.setTimeperiod(timeperiod);
			usedElem.setExecTime(null);
			usedElem.setCallsPerInterval(null);
			usedElem.setValue(usedMem);
			statList.add(usedElem);
			
			StoreIncomingStatisticsElement commitedElem = new StoreIncomingStatisticsElement();
			commitedElem.setGuiPath(agentName + ":Memory:Heap:Committed");
			commitedElem.setTimeperiod(timeperiod);
			commitedElem.setExecTime(null);
			commitedElem.setCallsPerInterval(null);
			commitedElem.setValue(commitedMem);
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
			initElem.setExecTime(null);
			initElem.setCallsPerInterval(null);
			initElem.setValue(initMem);
			statList.add(initElem);
			
			StoreIncomingStatisticsElement maxElem = new StoreIncomingStatisticsElement();
			maxElem.setGuiPath(agentName + ":Memory:NonHeap:Max");
			maxElem.setTimeperiod(timeperiod);
			maxElem.setExecTime(null);
			maxElem.setCallsPerInterval(null);
			maxElem.setValue(maxMem);
			statList.add(maxElem);
			
			StoreIncomingStatisticsElement usedElem = new StoreIncomingStatisticsElement();
			usedElem.setGuiPath(agentName + ":Memory:NonHeap:Used");
			usedElem.setTimeperiod(timeperiod);
			usedElem.setExecTime(null);
			usedElem.setCallsPerInterval(null);
			usedElem.setValue(usedMem);
			statList.add(usedElem);
			
			StoreIncomingStatisticsElement commitedElem = new StoreIncomingStatisticsElement();
			commitedElem.setGuiPath(agentName + ":Memory:NonHeap:Committed");
			commitedElem.setTimeperiod(timeperiod);
			commitedElem.setExecTime(null);
			commitedElem.setCallsPerInterval(null);
			commitedElem.setValue(commitedMem);
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
			maxElem.setExecTime(null);
			maxElem.setCallsPerInterval(null);
			maxElem.setValue(threadCount);
			statList.add(maxElem);
			
			StoreIncomingStatisticsElement usedElem = new StoreIncomingStatisticsElement();
			usedElem.setGuiPath(agentName + ":Threads:PeakThreadCount");
			usedElem.setTimeperiod(timeperiod);
			usedElem.setExecTime(null);
			usedElem.setCallsPerInterval(null);
			usedElem.setValue(peakThreadCount);
			statList.add(usedElem);
			
			StoreIncomingStatisticsElement commitedElem = new StoreIncomingStatisticsElement();
			commitedElem.setGuiPath(agentName + ":Threads:TotalStartedThreads");
			commitedElem.setTimeperiod(timeperiod);
			commitedElem.setExecTime(null);
			commitedElem.setCallsPerInterval(null);
			commitedElem.setValue(totatStartedThreads);
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
			maxElem.setExecTime(null);
			maxElem.setCallsPerInterval(null);
			maxElem.setValue(threadCount);
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
			initElem.setExecTime(null);
			initElem.setCallsPerInterval(null);
			initElem.setValue(initMem);
			statList.add(initElem);
			
			StoreIncomingStatisticsElement maxElem = new StoreIncomingStatisticsElement();
			maxElem.setGuiPath(agentName + ":Memory:MemoryPool:" + name + ":Max");
			maxElem.setTimeperiod(timeperiod);
			maxElem.setExecTime(null);
			maxElem.setCallsPerInterval(null);
			maxElem.setValue(maxMem);
			statList.add(maxElem);
			
			StoreIncomingStatisticsElement usedElem = new StoreIncomingStatisticsElement();
			usedElem.setGuiPath(agentName + ":Memory:MemoryPool:" + name + ":Used");
			usedElem.setTimeperiod(timeperiod);
			usedElem.setExecTime(null);
			usedElem.setCallsPerInterval(null);
			usedElem.setValue(usedMem);
			statList.add(usedElem);
			
			StoreIncomingStatisticsElement commitedElem = new StoreIncomingStatisticsElement();
			commitedElem.setGuiPath(agentName + ":Memory:MemoryPool:" + name + ":Committed");
			commitedElem.setTimeperiod(timeperiod);
			commitedElem.setExecTime(null);
			commitedElem.setCallsPerInterval(null);
			commitedElem.setValue(commitedMem);
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
			commitedElem.setExecTime(null);
			commitedElem.setCallsPerInterval(null);
			commitedElem.setValue(gcTimeStr);
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

