package org.eurekaj.api.datatypes.basic;

/**
 * Created with IntelliJ IDEA.
 * User: joahaa
 * Date: 3/3/13
 * Time: 1:41 AM
 * To change this template use File | Settings | File Templates.
 */
public class BasicMetricHour {
    private String guiPath;
    private String accountName;
    private Long hoursSince1970;
    private Double [] metrics;
    private String valueType;
    private String unitType;

    public BasicMetricHour() {
    }

    public BasicMetricHour(String guiPath, String accountName, Long hoursSince1970, String valueType, String unitType) {
        this.guiPath = guiPath;
        this.accountName = accountName;
        this.hoursSince1970 = hoursSince1970;
        this.valueType = valueType;
        this.unitType = unitType;
        metrics = new Double[240];
    }

    public BasicMetricHour(String guiPath, String accountName, Long hoursSince1970, Double[] metrics, String valueType, String unitType) {
        this.guiPath = guiPath;
        this.accountName = accountName;
        this.hoursSince1970 = hoursSince1970;
        this.metrics = metrics;
        this.valueType = valueType;
        this.unitType = unitType;
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

    public Long getHoursSince1970() {
        return hoursSince1970;
    }

    public void setHoursSince1970(Long hoursSince1970) {
        this.hoursSince1970 = hoursSince1970;
    }

    public Double[] getMetrics() {
        return metrics;
    }

    public void setMetrics(Double[] metrics) {
        this.metrics = metrics;
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
}
