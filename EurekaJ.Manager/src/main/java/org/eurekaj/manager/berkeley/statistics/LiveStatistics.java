package org.eurekaj.manager.berkeley.statistics;

import com.sleepycat.persist.model.Entity;
import com.sleepycat.persist.model.PrimaryKey;

@Entity
public class LiveStatistics implements Comparable<LiveStatistics>{
	@PrimaryKey private LiveStatisticsPk pk;
	private Double totalExecutionTime;
	private Long callsPerInterval;
	private Long value;
	
	public LiveStatistics() {
		super();
	}
	
	public LiveStatisticsPk getPk() {
		return pk;
	}
	
	public void setPk(LiveStatisticsPk pk) {
		this.pk = pk;
	}
	
	public Double getTotalExecutionTime() {
		return totalExecutionTime;
	}
	
	public Double getTotalExecutionTimeMillis() {
		if (totalExecutionTime != null) {
			return this.totalExecutionTime / 1000000;
		}
		
		return 0d;
	}
	
	public void setTotalExecutionTime(Double totalExecutionTime) {
		this.totalExecutionTime = totalExecutionTime;
	}
	
	public void addTotalExecutionTime(Double execTime) {
		if (this.totalExecutionTime == null) {
			this.totalExecutionTime = execTime;
		} else if (execTime != null) {
			this.totalExecutionTime += execTime;
		}
	}
	
	public Double getAvgExecutionTime() {
		if (this.totalExecutionTime == null || this.callsPerInterval == null) {
			return null;
		}
		
		//Convert from nanoseconds to milliseconds
		return (totalExecutionTime / 1000000) / callsPerInterval;
	}

	public Long getCallsPerInterval() {
		return callsPerInterval;
	}

	public void setCallsPerInterval(Long callsPerInterval) {
		this.callsPerInterval = callsPerInterval;
	}
	
	public void addCallsPerInterval(Long calls) {
		if (this.callsPerInterval == null) {
			this.callsPerInterval = calls;
		} else if (calls != null) {
			this.callsPerInterval += calls;
		}
	}

	public Long getValue() {
		return value;
	}

	public void setValue(Long value) {
		this.value = value;
	}
	
	@Override
	public String toString() {
		return "LiveStatistics [totalExecutionTime=" + totalExecutionTime
				+ ", callsPerInterval=" + callsPerInterval + ", guiPath=" + pk.getGuiPath()+ ", timeperiod="
				+ pk.getTimeperiod() + ", value=" + value + "]";
	}

	public int compareTo(LiveStatistics other) {
		if (other == null || other.getPk().getTimeperiod() == null) {
			return 1;
		}
		
		if (this.getPk().getTimeperiod() == null) {
			return -1;
		}
		
		return this.getPk().getTimeperiod().compareTo(other.getPk().getTimeperiod());
	}
}
