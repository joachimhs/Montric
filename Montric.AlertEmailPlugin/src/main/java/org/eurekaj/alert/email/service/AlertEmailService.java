package org.eurekaj.alert.email.service;

import java.util.Properties;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import org.apache.log4j.Logger;
import org.eurekaj.alert.email.datatypes.AlertEmailRecipientGroup;
import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.datatypes.EmailRecipientGroup;
import org.eurekaj.api.enumtypes.AlertStatus;
import org.eurekaj.api.service.AlertService;

public class AlertEmailService implements AlertService {
	private static final Logger log = Logger.getLogger(AlertEmailService.class);
	private ScheduledThreadPoolExecutor threadPool;
	
	public AlertEmailService() {
		threadPool = new ScheduledThreadPoolExecutor(10);
	}
	
	@Override
	public void sendAlert(Properties alertProperties, Alert alert, AlertStatus oldStatus, double currValue, String timeString) {
		log.debug("Scheduling alert: "+ alert.getAlertName() + " with status: " + alert.getStatus());
		
		EmailRecipientGroup emailRecipientGroup = new AlertEmailRecipientGroup(alertProperties);
		SendAlertEmailTask sendAlertEmailTask = new SendAlertEmailTask(emailRecipientGroup, alert, oldStatus, currValue, timeString);
		threadPool.schedule(sendAlertEmailTask, 0, TimeUnit.MILLISECONDS);
		
	}
}
