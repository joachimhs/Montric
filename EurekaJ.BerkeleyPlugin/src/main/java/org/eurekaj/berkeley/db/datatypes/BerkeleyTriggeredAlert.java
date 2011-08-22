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
import org.eurekaj.api.datatypes.TriggeredAlert;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 2/10/11
 * Time: 4:20 PM
 * To change this template use File | Settings | File Templates.
 */
@Entity
public class BerkeleyTriggeredAlert implements TriggeredAlert {
    @PrimaryKey private BerkeleyTriggeredAlertPk pk;
    private Double errorValue;
	private Double warningValue;
    private Double alertValue;
    @SecondaryKey(relate = Relationship.ONE_TO_ONE) private Long triggeredTimeperiod;

    public BerkeleyTriggeredAlert(TriggeredAlert triggeredAlert) {
        this.pk = new BerkeleyTriggeredAlertPk();
        this.pk.setAlertName(triggeredAlert.getAlertName());
        this.pk.setTimeperiod(triggeredAlert.getTimeperiod());
        this.errorValue = triggeredAlert.getErrorValue();
        this.warningValue = triggeredAlert.getWarningValue();
        this.alertValue = triggeredAlert.getAlertValue();
        this.triggeredTimeperiod = triggeredAlert.getTimeperiod();
    }


    public BerkeleyTriggeredAlert(BerkeleyTriggeredAlertPk pk, Double errorValue, Double warningValue, Double alertValue) {
        this.pk = pk;
        this.errorValue = errorValue;
        this.warningValue = warningValue;
        this.alertValue = alertValue;
        this.triggeredTimeperiod = pk.getTimeperiod();
    }

    public BerkeleyTriggeredAlert() {
    }

    public BerkeleyTriggeredAlertPk getPk() {
        return pk;
    }

    public void setPk(BerkeleyTriggeredAlertPk pk) {
        this.pk = pk;
    }

    @Override
    public String getAlertName() {
        return this.pk.getAlertName();
    }

    @Override
    public Long getTimeperiod() {
        return this.pk.getTimeperiod();
    }

    public Double getErrorValue() {
        return errorValue;
    }

    public void setErrorValue(Double errorValue) {
        this.errorValue = errorValue;
    }

    public Double getWarningValue() {
        return warningValue;
    }

    public void setWarningValue(Double warningValue) {
        this.warningValue = warningValue;
    }

    public Double getAlertValue() {
        return alertValue;
    }

    public void setAlertValue(Double alertValue) {
        this.alertValue = alertValue;
    }
}
