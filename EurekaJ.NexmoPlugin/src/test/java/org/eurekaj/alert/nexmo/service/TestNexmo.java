package org.eurekaj.alert.nexmo.service;

import java.util.List;
import java.util.Properties;

import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.enumtypes.AlertStatus;
import org.eurekaj.api.enumtypes.AlertType;
import org.junit.Ignore;
import org.junit.Test;

public class TestNexmo {

	@Test
	@Ignore //I dont want this test to run on each build
	public void testNexmo() {
		NexmoServiceExecutor executor = new NexmoServiceExecutor();
		Properties nexmoProperties = new Properties();
		nexmoProperties.setProperty("org.eurekaj.plugin.alert.nexmoPlugin.username", "d2ef1f89");
		nexmoProperties.setProperty("org.eurekaj.plugin.alert.nexmoPlugin.password", "fc8ad737");
		nexmoProperties.setProperty("org.eurekaj.plugin.alert.nexmoPlugin.from", "Joachim");
		nexmoProperties.setProperty("org.eurekaj.plugin.alert.nexmoPlugin.to", "004741415805");
		
		Alert alert = new Alert() {
			
			@Override
			public boolean isActivated() {
				return true;
			}
			
			@Override
			public Double getWarningValue() {
				return 85d;
			}
			
			@Override
			public AlertStatus getStatus() {
				return AlertStatus.CRITICAL;
			}
			
			@Override
			public List<String> getSelectedEmailSenderList() {
				return null;
			}
			
			@Override
			public AlertType getSelectedAlertType() {
				return AlertType.GREATER_THAN;
			}
			
			@Override
			public String getGuiPath() {
				return "Test:Nexmo:Value";
			}
			
			@Override
			public Double getErrorValue() {
				return 90d;
			}
			
			@Override
			public String getAlertName() {
				return "Test Alert Name";
			}
			
			@Override
			public long getAlertDelay() {
				return 0;
			}
		};
		
		executor.getAlertService().sendAlert(nexmoProperties, alert, AlertStatus.NORMAL, 95d, "19/11/2011 12:18:00");
		
		try {
			Thread.sleep(1000);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
