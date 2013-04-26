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
package org.eurekaj.manager.internal;

import java.util.List;

public class LogDaoImpl implements LogDao {
	//private BerkeleyDbEnv dbEnvironment;
	//private PrimaryIndex<LogEntryPk, LogEntry> logEntryPrimaryIdx;
	
	public LogEntry getLogEntry(String agentName, Long millisecond) {
		/*LogEntryPk pk = new LogEntryPk();
		pk.setAgentName(agentName);
		pk.setMillisecond(millisecond);
		
		LogEntry logEntry = logEntryPrimaryIdx.get(pk);
		return logEntry;*/
        return null;
	}
	
	public List<LogEntry> getLogEntry(String agentName, Long fromMillisecond,
			Long toMillisecond) {
		/*List<LogEntry> retList = new ArrayList<LogEntry>();
		
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
		return retList;*/
        return null;
	}
	
	public void persistLogEntry(LogEntry logEntry) {
		//logEntryPrimaryIdx.put(logEntry);
	}
	
	public void storeLog(String agentName, Long millisecond, String logMessage) {
		/*LogEntry logEntry = getLogEntry(agentName, millisecond);
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
		
		persistLogEntry(logEntry);*/
	}
}
