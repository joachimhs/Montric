package org.eurekaj.manager.internal;

import java.util.List;

import org.eurekaj.manager.internal.LogEntry;

public interface LogDao {

	public LogEntry getLogEntry(String agentName, Long millisecond);
	
	public List<LogEntry> getLogEntry(String agentName, Long fromMillisecond, Long toMillisecond);
	
	public void persistLogEntry(LogEntry logEntry);
	
	public void storeLog(String agentName, Long millisecond, String logMessage);
}
