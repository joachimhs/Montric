package org.eurekaj.manager.internal;

public class LogEntryPk {
	private String agentName;
	private Long millisecond;
	
	public LogEntryPk() {
		// TODO Auto-generated constructor stub
	}
	
	public String getAgentName() {
		return agentName;
	}
	
	public void setAgentName(String agentName) {
		this.agentName = agentName;
	}
	
	public Long getMillisecond() {
		return millisecond;
	}
	
	public void setMillisecond(Long millisecond) {
		this.millisecond = millisecond;
	}
}
