/**
    EurekaJ Profiler - http://eurekaj.haagen.name
    
    Copyright (C) 2010-2011 Joachim Haagen Skeie

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
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
