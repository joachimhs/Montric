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
package org.eurekaj.manager.datatypes;

import org.eurekaj.api.datatypes.LiveStatistics;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/6/11
 * Time: 10:51 AM
 * To change this template use File | Settings | File Templates.
 */
public class ManagerLiveStatistics implements LiveStatistics {
    private String guiPath;
    private String accountName;
    private Long timeperiod;
    private Double value;
    private String valueType;
    private String unitType;

    public ManagerLiveStatistics() {
    }

    public ManagerLiveStatistics(String guiPath, String accountName, Long timeperiod, Double value) {
        this.guiPath = guiPath;
        this.accountName = accountName;
        this.timeperiod = timeperiod;
        this.value = value;
    }

    public ManagerLiveStatistics(LiveStatistics liveStatistics) {
        this.guiPath = liveStatistics.getGuiPath();
        this.accountName = liveStatistics.getAccountName();
        this.timeperiod = liveStatistics.getTimeperiod();
        this.value = liveStatistics.getValue();
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

    public String getValueType() {
        return valueType;
    }

    public void setValueType(String valueType) {
        this.valueType = valueType;
    }

    public String getUnitType() {
        return unitType;
    }

    public void setUnitType(String unitType) {
        this.unitType = unitType;
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
