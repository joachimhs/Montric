package org.eurekaj.api.datatypes.basic;

import java.util.List;

import org.eurekaj.api.datatypes.AlertRecipient;

public class BasicAlertRecipient implements AlertRecipient {
	private String id;
	private String accountName;
	private String pluginName;
	private List<IdObject> recipients;
	
	public BasicAlertRecipient() {
		// TODO Auto-generated constructor stub
	}
	
	public BasicAlertRecipient(AlertRecipient alertRecipient) {
		this.id = alertRecipient.getId();
		this.accountName = alertRecipient.getAccountName();
		this.pluginName = alertRecipient.getPluginName();
		this.recipients = alertRecipient.getRecipients();
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}
	
	@Override
	public String getAccountName() {
		return accountName;
	}
	
	public void setAccountName(String accountName) {
		this.accountName = accountName;
	}

	public String getPluginName() {
		return pluginName;
	}

	public void setPluginName(String pluginName) {
		this.pluginName = pluginName;
	}

	public List<IdObject> getRecipients() {
		return recipients;
	}

	public void setRecipients(List<IdObject> recipients) {
		this.recipients = recipients;
	}
}
