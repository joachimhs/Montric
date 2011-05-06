package org.eurekaj.api.datatypes;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/6/11
 * Time: 12:17 AM
 * To change this template use File | Settings | File Templates.
 */
public interface TriggeredAlert {
    public String getAlertName();

    public Long getTimeperiod();

    public Double getErrorValue();

    public Double getWarningValue();

    public Double getAlertValue();
}
