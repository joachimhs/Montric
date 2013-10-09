package org.eurekaj.statistics.service;

import org.eurekaj.api.datatypes.LiveStatistics;
import org.eurekaj.api.datatypes.basic.BasicStatistics;
import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.api.enumtypes.ValueType;
import org.eurekaj.api.service.EurekaJProcessIncomingStatisticsService;
import org.eurekaj.spi.db.EurekaJDBPluginService;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 4/3/12
 * Time: 9:17 PM
 * To change this template use File | Settings | File Templates.
 */
public class AggregateLiveStatisticsService implements EurekaJProcessIncomingStatisticsService {
    private EurekaJDBPluginService eurekaJDBPluginService = null;

    public void setEurekaJDBPluginService(EurekaJDBPluginService eurekaJDBPluginService) {
        this.eurekaJDBPluginService = eurekaJDBPluginService;
    }

    @Override
    public void processStatistics(List<LiveStatistics> liveStatisticsList) {
        for (LiveStatistics liveStatistics : liveStatisticsList) {
            String value = null;
            if (liveStatistics.getValue() != null) {
                value = liveStatistics.getValue().toString();
            }

            if (eurekaJDBPluginService != null) {
                String accountName = liveStatistics.getAccountName();
                eurekaJDBPluginService.getTreeMenuDao().persistTreeMenu(new BasicStatistics(liveStatistics.getGuiPath(), liveStatistics.getAccountName(), "Y"));
            }
        }
        
        if (eurekaJDBPluginService != null) {
        	eurekaJDBPluginService.getLiveStatissticsDao().storeIncomingStatistics(liveStatisticsList);
        }
    }
}
