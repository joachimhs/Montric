package org.eurekaj.berkeley.db.datatypes;

import com.sleepycat.persist.model.Entity;
import com.sleepycat.persist.model.PrimaryKey;
import com.sleepycat.persist.model.Relationship;
import com.sleepycat.persist.model.SecondaryKey;
import org.eurekaj.api.datatypes.LiveStatistics;

@Entity(version = 5)
public class BerkeleyLiveStatistics implements Comparable<LiveStatistics>, LiveStatistics {
	@PrimaryKey private BerkeleyLiveStatisticsPk pk;
	private Double value;
    //Many stats may have the same timeperiood
    @SecondaryKey(relate = Relationship.MANY_TO_ONE) private Long secondaryTimeperiod;

    public BerkeleyLiveStatistics(String guiPath, Long timeperiod, Double value) {
        BerkeleyLiveStatisticsPk pk = new BerkeleyLiveStatisticsPk();
        pk.setGuiPath(guiPath);
        pk.setTimeperiod(timeperiod);
        this.pk = pk;
        this.value = value;
        this.secondaryTimeperiod = timeperiod;
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

    public void setTimeperiod(Long timeperiod) {
        this.pk.setTimeperiod(timeperiod);
        this.secondaryTimeperiod = timeperiod;
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
