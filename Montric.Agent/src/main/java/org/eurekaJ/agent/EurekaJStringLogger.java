package org.eurekaJ.agent;

import java.text.NumberFormat;
import java.util.Calendar;
import java.util.Hashtable;

import org.apache.log4j.FileAppender;
import org.apache.log4j.Logger;
import org.apache.log4j.PatternLayout;
import org.eurekaJ.agent.model.CallStack;
import org.eurekaJ.agent.model.CallStackTraceBuilderState;
import org.eurekaJ.agent.model.StatisticInfo;

public class EurekaJStringLogger {
	private static Logger log = Logger.getLogger(EurekaJStringLogger.class);
	private static Hashtable<String, StatisticInfo> statHash = new Hashtable<String, StatisticInfo>();
	private static Hashtable<String, StatisticInfo> groupStatHash = new Hashtable<String, StatisticInfo>();
	private static Hashtable<String, StatisticInfo> valueHash = new Hashtable<String, StatisticInfo>();

	public synchronized static void appendToBuffer(String logEntry) {
		// for (int i = 0; i < 20; i++) {
		//buffer.append(logEntry);
		log.trace(logEntry);
		// }		
		
		//System.out.println("Adding log entry: " + logEntry);
		// System.out.println(buffer.toString());
	}
	
	public synchronized static void addStatistic(String name, long executionTime, long executionStart, String classType, String path) {
		boolean newStat = false;
		StatisticInfo si = statHash.get(name);
		if (si == null) {
			si = new StatisticInfo();
			si.setName(name);
			si.setClassType(classType);
			si.setPath(path);
			newStat = true;
		}
		
		si.addStat(executionTime, executionStart);
		
		if (newStat) {
			statHash.put(name, si);
		}
	}
	
	public synchronized static void addGroupStatistics(String name, long executionTime, long executionStart, String classType) {
		boolean newStat = false;
		StatisticInfo si = groupStatHash.get(name);
		if (si == null) {
			si = new StatisticInfo();
			si.setName(name);
			si.setClassType(classType);
			newStat = true;
		}
		
		si.addStat(executionTime, executionStart);
		
		if (newStat) {
			groupStatHash.put(name, si);
		}
	}
	
	public synchronized static void addIncrement(String path) {
		boolean newStat = false;
		System.out.println("\tIncrementing count for: " + path);
		StatisticInfo si = valueHash.get(path);
		if (si == null) {
			si = new StatisticInfo();
			si.setName(path);
			si.setValue(1l);
			newStat = true;
		} else {
			si.setValue(si.getValue() + 1L);
		}
		
		if (newStat) {
			valueHash.put(path, si);
		}
	}
	
	public synchronized static void addDecrement(String path) {
		System.out.println("\tDecrementing count for: " + path);
		StatisticInfo si = valueHash.get(path);
		if (si != null) {
			si.setValue(si.getValue() - 1l);
		}
	}

	public synchronized static String getAndClearBufferContents() {
		for (StatisticInfo si : statHash.values()) {
			appendToBuffer("ClassInstrumentation: " + System.getProperties().getProperty("org.eurekaJ.agentName") + " " + si.toString());
		}
		
		statHash.clear();
		
		return "";
	}
	
	public synchronized static void logAndClearGroupStat() {
		NumberFormat format = NumberFormat.getInstance();
		format.setMaximumFractionDigits(2);
		format.setMinimumFractionDigits(0);
		format.setGroupingUsed(false);
		
		for (StatisticInfo si: groupStatHash.values()) {
			long time = ((long)(si.getMinTimestamp() / 15)) * 15; //Round down to nearest 15 second period 00, 15, 30, 45
			StringBuffer sb = new StringBuffer();
			sb.append(si.getName()).append(" ")
				.append(time).append(" ").
				append(format.format(si.getAvgExecutionTime())).append(" ").
				append(si.getCallsPerInterval());
			appendToBuffer("GroupInstrumentation: " + System.getProperties().getProperty("org.eurekaJ.agentName") + " " + sb.toString() + " " + si.getClassType());
		}
		
		groupStatHash.clear();
	}
	
	public synchronized static void logValueStat() {
		NumberFormat format = NumberFormat.getInstance();
		format.setMaximumFractionDigits(2);
		format.setMinimumFractionDigits(0);
		format.setGroupingUsed(false);
		
		System.out.println("ValueHash has : " + valueHash.values().size() + " values");
		for (StatisticInfo si: valueHash.values()) {
			StringBuffer sb = new StringBuffer();
			sb.append(si.getName()).append(" ").
				append(si.getValue());
			appendToBuffer("ValueInstrumentation: " + System.getProperties().getProperty("org.eurekaJ.agentName") + " " + sb.toString() + " " + Calendar.getInstance().getTimeInMillis());
			System.out.println("ValueInstrumentation: " + System.getProperties().getProperty("org.eurekaJ.agentName") + " " + sb.toString() + " " + Calendar.getInstance().getTimeInMillis());
		}
	}

	public synchronized static void logCallStack(CallStackTraceBuilderState callStackState) {
		//Only calls originating from a Frontend class is sent to the Manager 
		//if (callStackState.getClassType().equalsIgnoreCase("Frontend") || callStackState.getClassType().equalsIgnoreCase("Frontends")) {
			CallStack topLevelCallStack = callStackState.getCallStack();
			StringBuffer sb = new StringBuffer();
			
			sb.append("CallStacktrace: ").append(topLevelCallStack.getThreadName()).append("(").append(topLevelCallStack.getThreadid()).append(") ");
			sb.append(System.getProperties().getProperty("org.eurekaJ.agentName")).append(" ").append(callStackState.getClassType()).append(" ");
			sb.append(callStackState.getPath()).append(" ").append(callStackState.getClassName()).append(" ").append(callStackState.getMethodName()).append(" ");
			sb.append(callStackState.getStartTimestamp()).append(" ").append(callStackState.getStopTimestamp()).append(";");
			sb.append(recursiveCallStackLogger(topLevelCallStack, 1));
			appendToBuffer(sb.toString());
		//}
	}

	private static String recursiveCallStackLogger(CallStack callStack, int level) {
		StringBuilder sb = new StringBuilder();
		sb.append(callStack + ";");

		for (CallStack nextCall : callStack.getMethodCalls()) {
			sb.append(recursiveCallStackLogger(nextCall, level++));
		}

		return sb.toString();
	}
}
