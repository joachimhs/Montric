package org.eurekaj.manager.berkeley.statistics;

import com.sleepycat.persist.model.Entity;
import com.sleepycat.persist.model.PrimaryKey;

@Entity
public class LiveStatistics implements Comparable<LiveStatistics>{
	@PrimaryKey private LiveStatisticsPk pk;
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
	

	public Long getValue() {
		return value;
	}

	public void setValue(Long value) {
		this.value = value;
	}
	
	@Override
	public String toString() {
		return "LiveStatistics [guiPath=" + pk.getGuiPath()+ ", timeperiod="
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
