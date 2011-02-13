package org.eurekaj.manager.berkeley.alert;

import com.sleepycat.persist.model.Entity;
import com.sleepycat.persist.model.PrimaryKey;
import com.sleepycat.persist.model.Relationship;
import com.sleepycat.persist.model.SecondaryKey;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 2/10/11
 * Time: 4:20 PM
 * To change this template use File | Settings | File Templates.
 */
@Entity
public class TriggeredAlert {
    @PrimaryKey private TriggeredAlertPk pk;
    private Double errorValue;
	private Double warningValue;
    private Double alertValue;
    @SecondaryKey(relate = Relationship.ONE_TO_ONE) private Long triggeredTimeperiod;

    public TriggeredAlert(String alertName, Long timeperiod, Double errorValue, Double warningValue, Double alertValue) {
        this.pk = new TriggeredAlertPk(alertName, timeperiod);
        this.errorValue = errorValue;
        this.warningValue = warningValue;
        this.alertValue = alertValue;
        this.triggeredTimeperiod = timeperiod;
    }

    public TriggeredAlert(TriggeredAlertPk pk, Double errorValue, Double warningValue, Double alertValue) {
        this.pk = pk;
        this.errorValue = errorValue;
        this.warningValue = warningValue;
        this.alertValue = alertValue;
        this.triggeredTimeperiod = pk.getTimeperiod();
    }

    public TriggeredAlert() {
    }

    public TriggeredAlertPk getPk() {
        return pk;
    }

    public void setPk(TriggeredAlertPk pk) {
        this.pk = pk;
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
