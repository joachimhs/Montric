package org.eurekaj.simpledb.datatypes;

import org.eurekaj.api.datatypes.TriggeredAlert;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 5/7/11
 * Time: 11:42 AM
 * To change this template use File | Settings | File Templates.
 */
public class SimpleDBTriggeredAlert implements TriggeredAlert {
    private String alertName;
    private Long timeperiod;
    private Double errorValue;
	private Double warningValue;
    private Double alertValue;
    private Long triggeredTimeperiod;

    public SimpleDBTriggeredAlert(TriggeredAlert triggeredAlert) {
        this.alertName = triggeredAlert.getAlertName();
        this.timeperiod = triggeredAlert.getTimeperiod();
        this.errorValue = triggeredAlert.getErrorValue();
        this.warningValue = triggeredAlert.getWarningValue();
        this.alertValue = triggeredAlert.getAlertValue();
        this.triggeredTimeperiod = triggeredAlert.getTimeperiod();
    }

    public SimpleDBTriggeredAlert() {
    }

    public String getAlertName() {
        return alertName;
    }

    public void setAlertName(String alertName) {
        this.alertName = alertName;
    }

    public Long getTimeperiod() {
        return timeperiod;
    }

    public void setTimeperiod(Long timeperiod) {
        this.timeperiod = timeperiod;
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

    public Long getTriggeredTimeperiod() {
        return triggeredTimeperiod;
    }

    public void setTriggeredTimeperiod(Long triggeredTimeperiod) {
        this.triggeredTimeperiod = triggeredTimeperiod;
    }
}
