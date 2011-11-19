package org.eurekaj.alert.nexmo.service;

import java.util.Properties;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import org.eurekaj.alert.nexmo.datatypes.AlertNexmoData;
import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.enumtypes.AlertStatus;
import org.eurekaj.api.service.AlertService;

public class NexmoAlertService implements AlertService {
	private ScheduledThreadPoolExecutor threadPool;
	
	public NexmoAlertService() {
		threadPool = new ScheduledThreadPoolExecutor(10);
	}
	@Override
	public void sendAlert(Properties alertProperties, Alert alert,
			AlertStatus oldStatus, double currValue, String timeString) {
		
		System.out.println("NexmoAlertService sendAlert()");
		AlertNexmoData smsData = new AlertNexmoData(alertProperties);
		SendTextMessageTask task = new SendTextMessageTask(alert, oldStatus, currValue, timeString, smsData);
		threadPool.schedule(task, 0, TimeUnit.MILLISECONDS);
		System.out.println("NexmoAlertService Alert Scheduled!");
	}

}
