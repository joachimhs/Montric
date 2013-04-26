package org.eurekaj.api.datatypes.basic;

import org.eurekaj.api.datatypes.TriggeredAlert;

/**
 * Created with IntelliJ IDEA.
 * User: joahaa
 * Date: 3/5/13
 * Time: 1:44 PM
 * To change this template use File | Settings | File Templates.
 */
public class BasicTriggeredAlert implements TriggeredAlert, Comparable<TriggeredAlert> {
    private String alertName;
    private String accountName;
    private Long timeperiod;
    private Double errorValue;
    private Double warningValue;
    private Double alertValue;
    private Long triggeredTimeperiod;

    public BasicTriggeredAlert() {
    }

    public BasicTriggeredAlert(TriggeredAlert triggeredAlert) {
        this.alertName = triggeredAlert.getAlertName();
        this.accountName = triggeredAlert.getAccountName();
        this.timeperiod = triggeredAlert.getTimeperiod();
        this.errorValue = triggeredAlert.getErrorValue();
        this.warningValue = triggeredAlert.getWarningValue();
        this.alertValue = triggeredAlert.getAlertValue();
        this.triggeredTimeperiod = triggeredAlert.getTimeperiod();
    }

    public String getAlertName() {
        return alertName;
    }

    public void setAlertName(String alertName) {
        this.alertName = alertName;
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

    @Override
    public int compareTo(TriggeredAlert other) {
        int compVal = 0;

        if (other == null || other.getAlertName() == null || other.getTimeperiod() == null) {
            return 1;
        }

        if (this.getAlertName() == null || this.getTimeperiod() == null) {
            return -1;
        }

        compVal = this.getAlertName().compareTo(other.getAlertName());

        //If alert name is equal, compare based on timeperiod as well.
        if (compVal == 0) {
            compVal = this.getTimeperiod().compareTo(other.getTimeperiod());
        }

        return compVal;
    }
}
