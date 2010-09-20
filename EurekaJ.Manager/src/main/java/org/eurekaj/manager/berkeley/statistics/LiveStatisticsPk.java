package org.eurekaJ.manager.berkeley.statistics;

import com.sleepycat.persist.model.KeyField;
import com.sleepycat.persist.model.Persistent;

@Persistent
public class LiveStatisticsPk {
	@KeyField(1) private String guiPath;
	@KeyField(2) private Long timeperiod;
	
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
}
