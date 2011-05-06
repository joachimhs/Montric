package org.eurekaj.manager.datatypes;

import org.eurekaj.api.datatypes.TriggeredAlert;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/6/11
 * Time: 10:39 AM
 * To change this template use File | Settings | File Templates.
 */
public class ManagerTriggeredAlert implements TriggeredAlert {
    private String alertName;
    private Long timeperiod;
    private Double errorValue;
	private Double warningValue;
    private Double alertValue;
    private Long triggeredTimeperiod;

    public ManagerTriggeredAlert(TriggeredAlert triggeredAlert) {
        this.alertName = triggeredAlert.getAlertName();
        this.timeperiod = triggeredAlert.getTimeperiod();
        this.errorValue = triggeredAlert.getErrorValue();
        this.warningValue = triggeredAlert.getWarningValue();
        this.alertValue = triggeredAlert.getAlertValue();
        this.triggeredTimeperiod = triggeredAlert.getTimeperiod();
    }

    public ManagerTriggeredAlert(String alertName, Long timeperiod, Double errorValue, Double warningValue, Double alertValue, Long triggeredTimeperiod) {
        this.alertName = alertName;
        this.timeperiod = timeperiod;
        this.errorValue = errorValue;
        this.warningValue = warningValue;
        this.alertValue = alertValue;
        this.triggeredTimeperiod = triggeredTimeperiod;
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
