package org.eurekaj.proxy;

import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.api.enumtypes.ValueType;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/18/11
 * Time: 11:39 PM
 * To change this template use File | Settings | File Templates.
 */
public class StoreIncomingStatisticsElement {
    private String guiPath;
    private Long timeperiod;
    private String value;
    private String valueType;
    private String unitType;

    public String getGuiPath() {
        return guiPath;
    }

    public void setGuiPath(String guiPath) {
        this.guiPath = guiPath;
    }

    public Long getTimeperiod() {
        return timeperiod;
    }

    public void setTimeperiod(Long timeperiod) {
        this.timeperiod = timeperiod;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
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
}
