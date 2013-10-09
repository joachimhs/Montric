package org.eurekaj.statistics.service;

import org.eurekaj.api.service.EurekaJProcessIncomingStatisticsService;
import org.eurekaj.spi.db.EurekaJDBPluginService;
import org.eurekaj.spi.statistics.EurekaJProcessIncomingStatisticsPluginService;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 4/3/12
 * Time: 9:27 PM
 * To change this template use File | Settings | File Templates.
 */
public class AggregateStatsServiceExecutor extends EurekaJProcessIncomingStatisticsPluginService {
    private AggregateLiveStatisticsService aggregateLiveStatisticsService;

    public AggregateStatsServiceExecutor() {
        this.aggregateLiveStatisticsService = new AggregateLiveStatisticsService();
    }

    @Override
    public String getPluginName() {
        return "AggregateStatsServicePlugin";
    }

    @Override
    public EurekaJProcessIncomingStatisticsService getProcessIncomingStatisticsService() {
        return aggregateLiveStatisticsService;
    }

    @Override
    public void setDBPlugin(EurekaJDBPluginService eurekaJDBPluginService) {
        aggregateLiveStatisticsService.setEurekaJDBPluginService(eurekaJDBPluginService);
    }
}
