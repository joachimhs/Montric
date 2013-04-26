package org.eurekaJ.agent.model;

import java.text.NumberFormat;

public class StatisticInfo {
	private String name;
	private Double avgExecutionTime;
	private Long callsPerInterval;
	private Long slowCalls;
	private Long minTimestamp;
	private Long maxTimestamp;
	private String classType;
	private String path;
	private Long value;
	
	public StatisticInfo() {
		avgExecutionTime = 0d;
		callsPerInterval = 0l;
		slowCalls = 0l;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Double getAvgExecutionTime() {
		return avgExecutionTime;
	}

	public void setAvgExecutionTime(Double avgExecutionTime) {
		this.avgExecutionTime = avgExecutionTime;
	}

	public Long getCallsPerInterval() {
		return callsPerInterval;
	}

	public void setCallsPerInterval(Long callsPerInterval) {
		this.callsPerInterval = callsPerInterval;
	}

	public Long getSlowCalls() {
		return slowCalls;
	}

	public void setSlowCalls(Long slowCalls) {
		this.slowCalls = slowCalls;
	}

	public Long getMinTimestamp() {
		return minTimestamp;
	}

	public void setMinTimestamp(Long minTimestamp) {
		this.minTimestamp = minTimestamp;
	}

	public Long getMaxTimestamp() {
		return maxTimestamp;
	}

	public void setMaxTimestamp(Long maxTimestamp) {
		this.maxTimestamp = maxTimestamp;
	}
	
	public String getClassType() {
		return classType;
	}
	
	public void setClassType(String classType) {
		this.classType = classType;
	}
	
	public String getPath() {
		return path;
	}
	
	public void setPath(String path) {
		this.path = path;
	}
	
	public Long getValue() {
		return value;
	}
	
	public void setValue(Long value) {
		this.value = value;
	}
	
	public void addStat(Long executionTime, Long executionStart){
		if (callsPerInterval.equals(0l)) {
			this.setAvgExecutionTime(executionTime.doubleValue());
			callsPerInterval++;
			minTimestamp = executionStart;
			maxTimestamp = executionStart;
		} else {
			Double totalExecTime = avgExecutionTime * callsPerInterval;
			totalExecTime += executionTime;
			callsPerInterval++;
			avgExecutionTime = totalExecTime / callsPerInterval;
			if (executionStart > maxTimestamp) { maxTimestamp = executionStart;}
			if (executionStart < minTimestamp) { minTimestamp = executionStart;}
		}
		
		if (executionTime > 30l) {
			slowCalls++;
		}
	}
	
	public String toString() {
		StringBuilder sb = new StringBuilder();
		
		long time = ((long)(this.minTimestamp / 15000)) * 15000; //Round down to nearest 15 second period 00, 15, 30, 45
		NumberFormat format = NumberFormat.getInstance();
		format.setMaximumFractionDigits(2);
		format.setMinimumFractionDigits(0);
		format.setGroupingUsed(false);
		
		sb.append(name).append(" ").append(time).append(" ").append(format.format(this.avgExecutionTime)).append(" ").append(this.callsPerInterval).append(" ");
		sb.append(this.classType).append(" ").append(this.path);
		
		return sb.toString();
	}

}
