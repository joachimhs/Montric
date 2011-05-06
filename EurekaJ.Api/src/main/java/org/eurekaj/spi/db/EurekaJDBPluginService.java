package org.eurekaj.spi.db;

import org.eurekaj.api.dao.*;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/5/11
 * Time: 9:32 PM
 * To change this template use File | Settings | File Templates.
 */
public abstract class EurekaJDBPluginService {
    public abstract String getPluginName();

    public abstract void setup();

    public abstract void tearDown();

    public abstract AlertDao getAlertDao();

    public abstract GroupedStatisticsDao getGroupedStatisticsDao();

    public abstract LiveStatisticsDao getLiveStatissticsDao();

    public abstract SmtpDao getSmtpDao();

    public abstract TreeMenuDao getTreeMenuDao();
}
