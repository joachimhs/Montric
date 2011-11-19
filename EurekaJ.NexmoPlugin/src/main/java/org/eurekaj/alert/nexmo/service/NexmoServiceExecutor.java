package org.eurekaj.alert.nexmo.service;

import org.eurekaj.api.service.AlertService;
import org.eurekaj.spi.alert.EurekaJAlertPluginService;

public class NexmoServiceExecutor extends EurekaJAlertPluginService{
	private final String pluginName = "nexmoPlugin";
	private NexmoAlertService nexmoAlertService;
	
	public NexmoServiceExecutor() {		
		nexmoAlertService = new NexmoAlertService();
	}
	
	@Override
	public String getAlertPluginName() {
		return pluginName;
	}

	@Override
	public AlertService getAlertService() {
		return nexmoAlertService;
	}

}
