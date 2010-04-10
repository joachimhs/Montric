package org.eurekaJ.manager.dao.berkeley;

import java.util.ArrayList;
import java.util.List;

import org.eurekaJ.manager.berkeley.BerkeleyDbEnv;
import org.eurekaJ.manager.berkeley.logentry.LogEntry;
import org.eurekaJ.manager.berkeley.logentry.LogEntryPk;

import com.sleepycat.persist.EntityCursor;
import com.sleepycat.persist.PrimaryIndex;

public class LogDaoImpl implements LogDao {
	private BerkeleyDbEnv dbEnvironment;
	private PrimaryIndex<LogEntryPk, LogEntry> logEntryPrimaryIdx;
	
	public void setDbEnvironment(BerkeleyDbEnv dbEnvironment) {
		this.dbEnvironment = dbEnvironment;
		this.dbEnvironment.getLogStore().getPrimaryIndex(LogEntryPk.class, LogEntry.class);
	}
	
	public LogEntry getLogEntry(String agentName, Long millisecond) {
		LogEntryPk pk = new LogEntryPk();
		pk.setAgentName(agentName);
		pk.setMillisecond(millisecond);
		
		LogEntry logEntry = logEntryPrimaryIdx.get(pk);
		return logEntry;
	}
	
	public List<LogEntry> getLogEntry(String agentName, Long fromMillisecond,
			Long toMillisecond) {
		List<LogEntry> retList = new ArrayList<LogEntry>();
		
		LogEntryPk fromPk = new LogEntryPk();
		fromPk.setAgentName(agentName);
		fromPk.setMillisecond(fromMillisecond);
		
		LogEntryPk toPk = new LogEntryPk();
		toPk.setAgentName(agentName);
		toPk.setMillisecond(toMillisecond);
		
		EntityCursor<LogEntry> pi_cursor = logEntryPrimaryIdx.entities(fromPk, true, toPk, true);
		try {
			for (LogEntry node : pi_cursor) {
				retList.add(node);
			}
		} finally {
			pi_cursor.close();
		}
		return retList;
	}
	
	public void persistLogEntry(LogEntry logEntry) {
		logEntryPrimaryIdx.put(logEntry);		
	}
	
	public void storeLog(String agentName, Long millisecond, String logMessage) {
		LogEntry logEntry = getLogEntry(agentName, millisecond);
		if (logEntry != null) {
			//Log for this millisecond exists. Update log
			logEntry.addToLogString(logMessage);
		} else {
			//Create new logEntry
			logEntry = new LogEntry();
			LogEntryPk pk = new LogEntryPk();
			pk.setAgentName(agentName);
			pk.setMillisecond(millisecond);
			
			logEntry.setPk(pk);
			logEntry.addToLogString(logMessage);
		}
		
		persistLogEntry(logEntry);
	}
}
