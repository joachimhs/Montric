package org.eurekaj.manager.plugin;

import org.eurekaj.spi.db.EurekaJDBPluginService;

import java.util.Iterator;
import java.util.ServiceLoader;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/6/11
 * Time: 11:01 AM
 * To change this template use File | Settings | File Templates.
 */
public class ManagerDbPluginService {
    private static ManagerDbPluginService pluginService = null;
    private ServiceLoader<EurekaJDBPluginService> loader;

    private ManagerDbPluginService() {
        loader = ServiceLoader.load(EurekaJDBPluginService.class);
        for (EurekaJDBPluginService pluginService : loader) {
            pluginService.setup();
        }
    }

    public static synchronized ManagerDbPluginService getInstance() {
        if (pluginService == null) {
            pluginService = new ManagerDbPluginService();
        }

        return pluginService;
    }

    public EurekaJDBPluginService getPluginServiceWithName(String wantedPluginName) {
        EurekaJDBPluginService returnPlugin = null;

        for (EurekaJDBPluginService pluginService : loader) {
            if (pluginService.getPluginName().equalsIgnoreCase(wantedPluginName)) {
                returnPlugin = pluginService;
                break;
            }
        }

        if (returnPlugin == null) {
            throw new IllegalArgumentException("There is no plugin named: " + wantedPluginName + ". Database storage is unavailable");
        }
        return returnPlugin;
    }
}
