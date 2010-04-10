package org.eurekaJ.manager.service;

import org.apache.log4j.Logger;

public class StatisticsParser {
	private static Logger log = Logger.getLogger(StatisticsParser.class);
	private static String DELIMETER = ";";

	private TreeMenuService treeMenuService;
	private LogService logService;
	
	public TreeMenuService getTreeMenuService() {
		return treeMenuService;
	}
	
	public void setTreeMenuService(TreeMenuService treeMenuService) {
		this.treeMenuService = treeMenuService;
	}
	
	public LogService getLogService() {
		return logService;
	}
	
	public void setLogService(LogService logService) {
		this.logService = logService;
	}

	public void processExecTime(String line) {
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
			
			treeMenuService.storeIncomingStatistics(sb.toString(), timeperiod, executionTime, null, null);
		}
	}
	
	public void processCallsPerInterval(String line) {
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
			
			treeMenuService.storeIncomingStatistics(sb.toString(), timeperiod, null, callsPerInterval, null);
		}
	}
	
	public void processValueInstrumentation(String line) {
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
			
			treeMenuService.storeIncomingStatistics(sb.toString(), timeperiod, null, null, value);
		}
	}
	
	public void processClassInstrumentation(String line) {
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
			
			treeMenuService.storeIncomingStatistics(sb.toString(), timeperiod, executionTime, callsPerInterval, null);	
			
			//System.out.println("Class: " +  className + ", Method: " + methodName + ", Timestamp: " + timestamp + ", ExecTime: " + executionTime);
		}
	}
	
	public void processGroupInstumentation(String line) {
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
			
			treeMenuService.storeIncomingStatistics(agentName + ":" + groupName, timeperiod, execTime, callsPerInterval, null);
		} 
	}
	
	public void processHeapMemory(String line) {
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

			treeMenuService.storeIncomingStatistics(agentName + ":Memory:Heap:Init", timeperiod, null, null, initMem);
			treeMenuService.storeIncomingStatistics(agentName + ":Memory:Heap:Max", timeperiod, null, null, maxMem);
			treeMenuService.storeIncomingStatistics(agentName + ":Memory:Heap:Used", timeperiod, null, null, usedMem);
			treeMenuService.storeIncomingStatistics(agentName + ":Memory:Heap:Committed", timeperiod, null, null, commitedMem);
			//System.out.println("Heap: " + timestampStr + " "+ maxMem + " " + usedMem + " " + commitedMem + " " + initMem);
		}
	}
	
	public void processValueInstumentation(String line) {
		//EurekaAgent Jetty:HttpSession 1 1237296234403
		String[] params = line.split(DELIMETER);
		String agentName;
		String path;
		String value;
		
		if (params.length == 4) {
			agentName = params[0];
			path = params[1];
			value = params[2];
			String timestampStr = params[3];
			Long timeperiod = 0l;
			try {
				timeperiod = Long.parseLong(timestampStr);
				timeperiod = ((long)(timeperiod / 15000)); //Data is stored in 15-second intervals
			} catch (NumberFormatException nfe) {
				System.err.println("Unable to read in timestamp");
			}
			
			StringBuilder sb = new StringBuilder();
			sb.append(agentName).
			append(":").
			append(path);
			
			treeMenuService.storeIncomingStatistics(sb.toString(), timeperiod, null, "1", value);
			
		}
	}
	
	public void processLogTrace(String trace) {
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
		
		logService.storeLog(agentName, millisecond, logTrace);
	}
	
	public void processNonHeapMemory(String line) {
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

			treeMenuService.storeIncomingStatistics(agentName + ":Memory:NonHeap:Init", timeperiod, null, null, initMem);
			treeMenuService.storeIncomingStatistics(agentName + ":Memory:NonHeap:Max", timeperiod, null, null, maxMem);
			treeMenuService.storeIncomingStatistics(agentName + ":Memory:NonHeap:Used", timeperiod, null, null, usedMem);
			treeMenuService.storeIncomingStatistics(agentName + ":Memory:NonHeap:Committed", timeperiod, null, null, commitedMem);
			//System.out.println("Heap: " + timestampStr + " "+ maxMem + " " + usedMem + " " + commitedMem + " " + initMem);
		}
	}
	
	public void processThreads(String line) {
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

			treeMenuService.storeIncomingStatistics(agentName + ":Threads:ThreadCount", timeperiod, null, null, threadCount);
			treeMenuService.storeIncomingStatistics(agentName + ":Threads:PeakThreadCount", timeperiod, null, null, peakThreadCount);
			treeMenuService.storeIncomingStatistics(agentName + ":Threads:TotalStartedThreads", timeperiod, null, null, totatStartedThreads);
			//System.out.println("Heap: " + timestampStr + " "+ maxMem + " " + usedMem + " " + commitedMem + " " + initMem);
		}
	}
	
	public void processThreadType(String line) {
		String params[] = line.split(DELIMETER);
		////"ThreadType: " + key + " " + val + " " + millis
		String agentName;
		String key;
		String val;
		String timestampStr;
		
		if (params.length == 4) {
			agentName = params[0];
			key = params[1];
			val = params[2];
			timestampStr = params[3];
			Long timeperiod = 0l;
			try {
				timeperiod = Long.parseLong(timestampStr);
				timeperiod = ((long)(timeperiod / 15000)); //Round down to nearest 15 second period 00, 15, 30, 45
			} catch (NumberFormatException nfe) {
				System.err.println("Unable to read in timestamp");
			}
			treeMenuService.storeIncomingStatistics(agentName + ":Threads:" + key , timeperiod, null, null, val);
			//System.out.println("Heap: " + timestampStr + " "+ maxMem + " " + usedMem + " " + commitedMem + " " + initMem);
		}
	}
	
	public void processMemoryPool(String line) {
		String[] params = line.split(DELIMETER);
		String agentName;
		String name;
		String maxMem;
		String usedMem;
		String commitedMem;
		String initMem;
		String timestampStr;

		if (params.length == 7) {
			
			//"MemoryPool: " + memPool.getName() + " " + memPool.getUsage().getMax() + " "
			//+ memPool.getUsage().getUsed() + " " + memPool.getUsage().getCommitted() + " " + memPool.getUsage().getInit() + " "
			//+ (Calendar.getInstance().getTimeInMillis() - 5));

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
			
			
			treeMenuService.storeIncomingStatistics(agentName + ":Memory:MemoryPool:" + name + ":Init", timeperiod, null, null, initMem);
			treeMenuService.storeIncomingStatistics(agentName + ":Memory:MemoryPool:" + name + ":Max", timeperiod, null, null, maxMem);
			treeMenuService.storeIncomingStatistics(agentName + ":Memory:MemoryPool:" + name + ":Used", timeperiod, null, null, usedMem);
			treeMenuService.storeIncomingStatistics(agentName + ":Memory:MemoryPool:" + name + ":Committed", timeperiod, null, null, commitedMem);
		}
	}
	
	public void processGCTime(String line) {
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
			
			treeMenuService.storeIncomingStatistics(agentName + ":Memory:GC:Time Spent In GC(%)", timeperiod, null, null, gcTimeStr);
			//treeMenuService.storeIncomingStatistics(agentName + ":Memory:GC:GC Count", timeperiod, classType, null, null, gcCountStr);
			//treeMenuService.storeIncomingStatistics(agentName + ":Memory:GC:Time Spent In GC(ms)", timeperiod, classType, null, null, msTimeStr);
		}
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
