package org.eurekaj.manager.dao.berkeley;

import java.util.List;

import org.eurekaj.manager.berkeley.logentry.LogEntry;

public interface LogDao {

	public LogEntry getLogEntry(String agentName, Long millisecond);
	
	public List<LogEntry> getLogEntry(String agentName, Long fromMillisecond, Long toMillisecond);
	
	public void persistLogEntry(LogEntry logEntry);
	
	public void storeLog(String agentName, Long millisecond, String logMessage);
}
