package org.eurekaj.simpledb.datatypes;

import org.eurekaj.api.datatypes.LiveStatistics;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 5/7/11
 * Time: 11:36 AM
 * To change this template use File | Settings | File Templates.
 */
public class SimpleDBLiveStatistics implements LiveStatistics, Comparable<LiveStatistics> {
    private String guiPath;
	private Long timeperiod;
    private Double value;

    public SimpleDBLiveStatistics() {
    }

    public SimpleDBLiveStatistics(String guiPath, Long timeperiod, Double value) {
        this.guiPath = guiPath;
        this.timeperiod = timeperiod;
        this.value = value;
    }

    public String getGuiPath() {
        return guiPath;
    }

    public void setGuiPath(String guiPath) {
        this.guiPath = guiPath;
    }

    public Long getTimeperiod() {
        return timeperiod;
    }

    public void setTimeperiod(Long timeperiod) {
        this.timeperiod = timeperiod;
    }

    public Double getValue() {
        return value;
    }

    public void setValue(Double value) {
        this.value = value;
    }

    public int compareTo(LiveStatistics other) {
		if (other == null || other.getTimeperiod() == null) {
			return 1;
		}

		if (this.getTimeperiod() == null) {
			return -1;
		}

		return this.getTimeperiod().compareTo(other.getTimeperiod());
	}
}
