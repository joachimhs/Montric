package org.eurekaj.api.service;

import java.util.Properties;

import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.enumtypes.AlertStatus;

public interface AlertService {

	public void sendAlert(Properties alertProperties, Alert alert, AlertStatus oldStatus, double currValue, String timeString);
}
