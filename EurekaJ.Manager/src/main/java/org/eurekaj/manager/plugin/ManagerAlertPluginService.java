package org.eurekaj.manager.plugin;

import java.util.Properties;
import java.util.ServiceLoader;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.enumtypes.AlertStatus;
import org.eurekaj.spi.alert.EurekaJAlertPluginService;

public class ManagerAlertPluginService {
	private static final Logger log = Logger.getLogger(ManagerAlertPluginService.class);
	private static ManagerAlertPluginService pluginService = null;
    private ServiceLoader<EurekaJAlertPluginService> loader;
    
	public ManagerAlertPluginService() {
		loader = ServiceLoader.load(EurekaJAlertPluginService.class);
	}
	
	public static ManagerAlertPluginService getInstance() {
		if (pluginService == null) {
			pluginService = new ManagerAlertPluginService();
		}
		
		return pluginService;
	}
	
	public void sendAlert(Properties alertProperties, Alert alert, AlertStatus oldStatus, double currValue, String timeString) {
		log.debug("Finding an alert plugin to send the alert");
		
		for (EurekaJAlertPluginService pluginService : loader) {			
			log.debug("Sending alert through plugin: " + pluginService.getAlertPluginName());
			pluginService.getAlertService().sendAlert(alertProperties, alert, oldStatus, currValue, timeString);
		}
	}
}
