package org.eurekaj.berkeley.db.datatypes;

import com.sleepycat.persist.model.Entity;
import com.sleepycat.persist.model.PrimaryKey;
import org.eurekaj.api.datatypes.LiveStatistics;

@Entity(version = 3)
public class BerkeleyLiveStatistics implements Comparable<LiveStatistics>, LiveStatistics {
	@PrimaryKey private BerkeleyLiveStatisticsPk pk;
	private Double value;

    public BerkeleyLiveStatistics(String guiPath, Long timeperiod, Double value) {
        BerkeleyLiveStatisticsPk pk = new BerkeleyLiveStatisticsPk();
        pk.setGuiPath(guiPath);
        pk.setTimeperiod(timeperiod);
        this.pk = pk;
        this.value = value;
    }

    public BerkeleyLiveStatistics() {
		super();
	}
	
	public BerkeleyLiveStatisticsPk getPk() {
		return pk;
	}
	
	public void setPk(BerkeleyLiveStatisticsPk pk) {
		this.pk = pk;
	}


    @Override
    public String getGuiPath() {
        return this.pk.getGuiPath();
    }

    @Override
    public Long getTimeperiod() {
        return this.pk.getTimeperiod();
    }

    public Double getValue() {
		return value;
	}

	public void setValue(Double value) {
		this.value = value;
	}
	
	@Override
	public String toString() {
		return "BerkeleyLiveStatistics [guiPath=" + pk.getGuiPath()+ ", timeperiod="
				+ pk.getTimeperiod() + ", value=" + value + "]";
	}

	public int compareTo(LiveStatistics other) {
		if (other == null || other.getTimeperiod() == null) {
			return 1;
		}
		
		if (this.getPk().getTimeperiod() == null) {
			return -1;
		}
		
		return this.getPk().getTimeperiod().compareTo(other.getTimeperiod());
	}
}
