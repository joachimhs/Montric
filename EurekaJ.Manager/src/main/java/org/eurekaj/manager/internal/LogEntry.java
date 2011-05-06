package org.eurekaj.manager.internal;


public class LogEntry {
	private LogEntryPk pk;
	private StringBuffer logString;
	
	public LogEntry() {
		// TODO Auto-generated constructor stub
		logString = new StringBuffer();
	}
	
	public LogEntryPk getPk() {
		return pk;
	}
	
	public void setPk(LogEntryPk pk) {
		this.pk = pk;
	}
	
	public void addToLogString(String log) {
		logString.append(log);
	}
	
	@Override
	public String toString() {
		return logString.toString();
	}
}
