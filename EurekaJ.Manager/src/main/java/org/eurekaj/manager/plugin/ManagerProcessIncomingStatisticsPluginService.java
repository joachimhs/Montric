package org.eurekaj.manager.plugin;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.LiveStatistics;
import org.eurekaj.api.service.EurekaJProcessIncomingStatisticsService;
import org.eurekaj.manager.util.ClassPathUtil;
import org.eurekaj.manager.util.DatabasePluginUtil;
import org.eurekaj.spi.db.EurekaJDBPluginService;
import org.eurekaj.spi.statistics.EurekaJProcessIncomingStatisticsPluginService;

import java.util.List;
import java.util.ServiceLoader;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 4/3/12
 * Time: 8:55 PM
 * To change this template use File | Settings | File Templates.
 */
public class ManagerProcessIncomingStatisticsPluginService implements EurekaJProcessIncomingStatisticsService {
    private static final Logger log = Logger.getLogger(ManagerProcessIncomingStatisticsPluginService.class);
    private static ManagerProcessIncomingStatisticsPluginService pluginService = null;
    private ServiceLoader<EurekaJProcessIncomingStatisticsPluginService> loader;
    private EurekaJDBPluginService dbPlugin = null;

    public ManagerProcessIncomingStatisticsPluginService() {
        ClassPathUtil.addPluginDirectory();
        loader = ServiceLoader.load(EurekaJProcessIncomingStatisticsPluginService.class);
        for (EurekaJProcessIncomingStatisticsPluginService statPluginEurekaJ : loader) {
            statPluginEurekaJ.setApplicationServices(EurekaJManagerApplicationServices.getInstance());
            statPluginEurekaJ.setDBPlugin(getDbPlugin());
        }
    }

    public static ManagerProcessIncomingStatisticsPluginService getInstance() {
        if (pluginService == null) {
            pluginService = new ManagerProcessIncomingStatisticsPluginService();
        }

        return pluginService;
    }

    private EurekaJDBPluginService getDbPlugin() {
        if (dbPlugin == null) {
            dbPlugin = ManagerDbPluginService.getInstance().getPluginServiceWithName(DatabasePluginUtil.getDatabasePluginName());
        }

        return dbPlugin;
    }


    public void processStatistics(List<LiveStatistics> liveStatisticsList) {
        for (EurekaJProcessIncomingStatisticsPluginService statPluginEurekaJ : loader) {
            statPluginEurekaJ.getProcessIncomingStatisticsService().processStatistics(liveStatisticsList);
        }
    }
}
