package org.eurekaJ.manager.service;

import java.util.List;

import org.eurekaJ.manager.berkeley.logentry.LogEntry;

public interface LogService {

	public LogEntry getLogEntry(String agentName, Long millisecond);
	
	public List<LogEntry> getLogEntry(String agentName, Long fromMillisecond, Long toMillisecond);
	
	public void persistLogEntry(LogEntry logEntry);
	
	public void storeLog(String agentName, Long millisecond, String logMessage);
}
