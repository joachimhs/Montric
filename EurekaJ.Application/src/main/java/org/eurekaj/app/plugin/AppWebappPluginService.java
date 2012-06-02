package org.eurekaj.app.plugin;

import java.util.ServiceLoader;

import org.apache.log4j.Logger;
import org.eurekaj.spi.webapp.EurekaJWebappPluginService;

public class AppWebappPluginService {
	private static Logger logger = Logger.getLogger(AppWebappPluginService.class.getName());
	private static AppWebappPluginService webappPluginService = null;
	private ServiceLoader<EurekaJWebappPluginService> serviceLoader;
	
	public AppWebappPluginService() {
		logger.info("Loading EurekaJWebappPluginService");
		serviceLoader = ServiceLoader.load(EurekaJWebappPluginService.class);
		
		for (EurekaJWebappPluginService pluginService : serviceLoader) {
			logger.info("Found EurekaJWebappPluginService class");
			pluginService.start();
		}
	}
	
}
