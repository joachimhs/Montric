package org.eurekaj.berkeley.db.datatypes;

import com.sleepycat.persist.model.KeyField;
import com.sleepycat.persist.model.Persistent;
import com.sleepycat.persist.model.Relationship;
import com.sleepycat.persist.model.SecondaryKey;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 2/10/11
 * Time: 4:20 PM
 * To change this template use File | Settings | File Templates.
 */
@Persistent
public class BerkeleyTriggeredAlertPk {
    @KeyField(1) private String alertName;
    @KeyField(2) private Long timeperiod;

    public BerkeleyTriggeredAlertPk(String alertName, Long timeperiod) {
        this.alertName = alertName;
        this.timeperiod = timeperiod;
    }

    public BerkeleyTriggeredAlertPk() {
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
}
