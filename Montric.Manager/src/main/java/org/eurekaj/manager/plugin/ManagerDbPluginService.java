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

import org.apache.log4j.Logger;
import org.eurekaj.manager.util.ClassPathUtil;
import org.eurekaj.spi.db.EurekaJDBPluginService;

import java.util.ServiceLoader;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/6/11
 * Time: 11:01 AM
 * To change this template use File | Settings | File Templates.
 */
public class ManagerDbPluginService {
	private static Logger logger = Logger.getLogger(ManagerDbPluginService.class.getName()); 
    private static ManagerDbPluginService pluginService = null;
    private ServiceLoader<EurekaJDBPluginService> loader;

    private ManagerDbPluginService() {
        ClassPathUtil.addPluginDirectory();
        loader = ServiceLoader.load(EurekaJDBPluginService.class);
        for (EurekaJDBPluginService pluginService : loader) {
        	logger.info("Calling setup for plugin: " + pluginService.getPluginName());
            pluginService.setApplicationServices(EurekaJManagerApplicationServices.getInstance());
            logger.info("Setup for plugin: " + pluginService.getPluginName() + " complete");
        }
    }

    public static synchronized ManagerDbPluginService getInstance() {
    	logger.info("Finding ManagerDbPluginService");
        if (pluginService == null) {
        	logger.info("Creating new Plugin Service");
            pluginService = new ManagerDbPluginService();
        }

        logger.info("Returning pluginService: " + pluginService);
        return pluginService;
    }

    public EurekaJDBPluginService getPluginServiceWithName(String wantedPluginName) {
        EurekaJDBPluginService returnPlugin = null;

        for (EurekaJDBPluginService pluginService : loader) {
            if (pluginService.getPluginName().equalsIgnoreCase(wantedPluginName)) {
            	pluginService.setup();
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
