package org.eurekaj.alert.email.service;

import java.util.List;
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
	private String smtpServerhost;
	private String smtpUsername;
	private String smtpPassword;
	private boolean useSSL;
	private Integer port = 25;
	private boolean configured = false;
	private String statusMessage = "";
	
	public AlertEmailService() {
		threadPool = new ScheduledThreadPoolExecutor(10);
	}
	
	@Override
	public void sendAlert(List<String> recipientList, Alert alert, AlertStatus oldStatus, double currValue, String timeString) {
		log.debug("Scheduling alert: "+ alert.getAlertName() + " with status: " + alert.getStatus());
		
		AlertEmailRecipientGroup emailRecipientGroup = new AlertEmailRecipientGroup();
		emailRecipientGroup.setAccountName(alert.getAccountName());
		emailRecipientGroup.setEmailRecipientList(recipientList);
		emailRecipientGroup.setPort(port);
		emailRecipientGroup.setSmtpPassword(smtpPassword);
		emailRecipientGroup.setSmtpUsername(smtpUsername);
		emailRecipientGroup.setSmtpServerhost(smtpServerhost);
		emailRecipientGroup.setUseSSL(useSSL);
		
		SendAlertEmailTask sendAlertEmailTask = new SendAlertEmailTask(emailRecipientGroup, alert, oldStatus, currValue, timeString);
		threadPool.schedule(sendAlertEmailTask, 0, TimeUnit.MILLISECONDS);
	}

	@Override
	public void configure() {
        this.smtpServerhost = System.getProperty("montric.plugin.alert.emailAlertPlugin.host");
        this.smtpUsername = System.getProperty("montric.plugin.alert.emailAlertPlugin.username");
        this.smtpPassword = System.getProperty("montric.plugin.alert.emailAlertPlugin.password");
        this.useSSL = new Boolean(System.getProperty("montric.plugin.alert.emailAlertPlugin.useSSL"));
        this.port = Integer.parseInt(System.getProperty("montric.plugin.alert.emailAlertPlugin.port", "-1"));

        if (smtpServerhost != null && smtpPassword != null && smtpUsername != null && port != -1) {
        	configured = true;
        	statusMessage = "OK";
        } 
        
        if (smtpServerhost == null) {
			configured = false;
			statusMessage = "SMTP Host is not configured. Configure in config.properties by defining montric.plugin.alert.emailAlertPlugin.host\n";
		}
        
        if (smtpUsername == null) {
			configured = false;
			statusMessage += "SMTP Username is not configured. Configure in config.properties by defining montric.plugin.alert.emailAlertPlugin.username\n";
		}
        
        if (smtpPassword == null) {
			configured = false;
			statusMessage += "SMTP Password is not configured. Configure in config.properties by defining montric.plugin.alert.emailAlertPlugin.password\n";
		}
        
        if (port == -1) {
			configured = false;
			statusMessage += "SMTP Port is not configured. Configure in config.properties by defining montric.plugin.alert.emailAlertPlugin.port\n";
		}
	}

	@Override
	public String getStatus() {
		return statusMessage;
	}

	@Override
	public int getOutstandingAlerts() {
		return threadPool.getQueue().size();
	}
}
