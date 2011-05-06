package org.eurekaj.api.datatypes;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/5/11
 * Time: 10:36 PM
 * To change this template use File | Settings | File Templates.
 */
public interface LiveStatistics extends Comparable<LiveStatistics> {
    public String getGuiPath();
    public Long getTimeperiod();
    public Double getValue();

}
