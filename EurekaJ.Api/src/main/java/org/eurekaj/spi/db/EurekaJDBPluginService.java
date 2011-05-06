package org.eurekaj.spi.db;

import org.eurekaj.api.dao.*;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/5/11
 * Time: 9:32 PM
 * To change this template use File | Settings | File Templates.
 */
public interface EurekaJDBPluginService {
    public String getPluginName();

    public void setup();

    public void tearDown();

    public AlertDao getAlertDao();

    public GroupedStatisticsDao getGroupedStatisticsDao();

    public LiveStatisticsDao getLiveStatissticsDao();

    public SmtpDao getSmtpDao();

    public TreeMenuDao getTreeMenuDao();
}
