package org.eurekaj.spi.statistics;

import org.eurekaj.api.service.EurekaJApplicationServices;
import org.eurekaj.api.service.EurekaJProcessIncomingStatisticsService;
import org.eurekaj.spi.db.EurekaJDBPluginService;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 4/3/12
 * Time: 8:53 PM
 * To change this template use File | Settings | File Templates.
 */
public abstract class EurekaJProcessIncomingStatisticsPluginService {
    
    public abstract String getPluginName();

    public abstract EurekaJProcessIncomingStatisticsService getProcessIncomingStatisticsService();

    public void setApplicationServices(EurekaJApplicationServices applicationServices) {
        //Each plugin must choose to implement this method in order to gain access to the EurekaJ Application Services
        return;
    }

    public void setDBPlugin(EurekaJDBPluginService eurekaJDBPluginService) {
        //Each plugin must choose to implement this method in order to gain access to the EurekaJ DB Plugin Service
        return;
    }
}
