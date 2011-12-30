package org.eurekaj.alert.email.service;

import org.eurekaj.api.service.AlertService;
import org.eurekaj.spi.alert.EurekaJAlertPluginService;


public class EmailAlertServiceExecutor extends EurekaJAlertPluginService {
	private final String alertPluginName = "alertEmailPlugin";
	private AlertEmailService alertService;
	
	public EmailAlertServiceExecutor() {
		alertService = new AlertEmailService();
	}
	
	@Override
	public String getAlertPluginName() {
		return alertPluginName;
	}
	
	@Override
	public AlertService getAlertService() {
		return alertService;
	}
}
