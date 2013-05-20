package org.eurekaj.api.service;

import java.util.List;
import java.util.Properties;

import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.enumtypes.AlertStatus;

public interface AlertService {
	public void configure();
	public String getStatus();
	public int getOutstandingAlerts();
	public void sendAlert(List<String> recipientList, Alert alert, AlertStatus oldStatus, double currValue, String timeString);
}
