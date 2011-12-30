/**
    EurekaJ Profiler - http://eurekaj.haagen.name
    
    Copyright (C) 2010-2011 Joachim Haagen Skeie

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
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
            pluginService.setApplicationServices(EurekaJManagerApplicationServices.getInstance());
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
