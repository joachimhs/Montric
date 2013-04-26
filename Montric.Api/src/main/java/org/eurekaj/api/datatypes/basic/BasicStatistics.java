package org.eurekaj.api.datatypes.basic;

import org.eurekaj.api.datatypes.Statistics;

public class BasicStatistics implements Statistics, Comparable<Statistics> {
	private String guiPath;
	private String accountName;
	private String nodeLive;
    private Long oneMinuteAverageLastUpdated;
    private Long fiveMinuteAverageLastUpdated;
	private Long halfHourAverageLastUpdated;
	private Long hourAverageLastUpdated;
	private Long dailyAverageLastUpdated;
	private Long weeklyAverageLastUpdated;
	
	public BasicStatistics() {
		super();
		halfHourAverageLastUpdated = 0l;
		hourAverageLastUpdated = 0l;
		dailyAverageLastUpdated = 0l;
		weeklyAverageLastUpdated = 0l;
        oneMinuteAverageLastUpdated = 0l;
        fiveMinuteAverageLastUpdated = 0l;
	}

	public BasicStatistics(String guiPath, String accountName, String nodeLive) {
		super();
		this.guiPath = guiPath;
		this.accountName = accountName;
		this.nodeLive = nodeLive;
		halfHourAverageLastUpdated = 0l;
		hourAverageLastUpdated = 0l;
		dailyAverageLastUpdated = 0l;
		weeklyAverageLastUpdated = 0l;
        oneMinuteAverageLastUpdated = 0l;
        fiveMinuteAverageLastUpdated = 0l;
	}

    public String getGuiPath() {
		return guiPath;
	}

	public void setGuiPath(String guiPath) {
		this.guiPath = guiPath;
	}

	public String getAccountName() {
		return accountName;
	}

	public void setAccountName(String accountName) {
		this.accountName = accountName;
	}

	public String getNodeLive() {
		return nodeLive;
	}
	public void setNodeLive(String nodeLive) {
		this.nodeLive = nodeLive;
	}

    public Long getOneMinuteAverageLastUpdated() {
        return oneMinuteAverageLastUpdated;
    }

    public void setOneMinuteAverageLastUpdated(Long oneMinuteAverageLastUpdated) {
        this.oneMinuteAverageLastUpdated = oneMinuteAverageLastUpdated;
    }

    public Long getFiveMinuteAverageLastUpdated() {
        return fiveMinuteAverageLastUpdated;
    }

    public void setFiveMinuteAverageLastUpdated(Long fiveMinuteAverageLastUpdated) {
        this.fiveMinuteAverageLastUpdated = fiveMinuteAverageLastUpdated;
    }

    public Long getDailyAverageLastUpdated() {
		return dailyAverageLastUpdated;
	}
	
	public void setDailyAverageLastUpdated(Long dailyAverageLastUpdated) {
		this.dailyAverageLastUpdated = dailyAverageLastUpdated;
	}
	
	public Long getHalfHourAverageLastUpdated() {
		return halfHourAverageLastUpdated;
	}
	
	public void setHalfHourAverageLastUpdated(Long halfHourAverageLastUpdated) {
		this.halfHourAverageLastUpdated = halfHourAverageLastUpdated;
	}
	
	public Long getHourAverageLastUpdated() {
		return hourAverageLastUpdated;
	}
	
	public void setHourAverageLastUpdated(Long hourAverageLastUpdated) {
		this.hourAverageLastUpdated = hourAverageLastUpdated;
	}
	
	public Long getWeeklyAverageLastUpdated() {
		return weeklyAverageLastUpdated;
	}
	
	public void setWeeklyAverageLastUpdated(Long weeklyAverageLastUpdated) {
		this.weeklyAverageLastUpdated = weeklyAverageLastUpdated;
	}
	
	public int compareTo(Statistics other) {
		if (other == null || other.getGuiPath() == null) {
			return 1;
		}
		
		if (this.getGuiPath() == null) {
			return -1;
		}
		
		return this.getGuiPath().compareTo(other.getGuiPath());
	}
	
	
}
