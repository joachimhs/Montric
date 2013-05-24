package org.eurekaj.api.dao;

import java.util.List;

import org.eurekaj.api.datatypes.AlertRecipient;

public interface AlertRecipientDao {
	
	public List<AlertRecipient> getAlertRecipients(String accountName);
	
	public AlertRecipient getAlertRecipient(String accountName, String alertRecipientName);

	public void persistAlertRecipient(AlertRecipient alertRecipient);
	
	public void deleteAlertRecipient(AlertRecipient alertRecipient);
	
	public void deleteAlertRecipient(String accountName, String id);
}
