package org.eurekaj.api.datatypes.basic;

import java.util.ArrayList;
import java.util.List;

import org.eurekaj.api.datatypes.AlertRecipient;

public class BasicAlertRecipient implements AlertRecipient {
	private String id;
	private String accountName;
	private String pluginName;
	private List<String> recipients;
	
	public BasicAlertRecipient() {
		recipients = new ArrayList<>();
	}
	
	public BasicAlertRecipient(AlertRecipient alertRecipient) {
		this();
		
		this.id = alertRecipient.getId();
		this.accountName = alertRecipient.getAccountName();
		this.pluginName = alertRecipient.getPluginName();
		
		if (alertRecipient.getRecipients() != null) {
			this.recipients = alertRecipient.getRecipients();
		}
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

	@Override
	public List<String> getRecipients() {
		return recipients;
	}
	
	public void setRecipients(List<String> recipients) {
		this.recipients = recipients;
	}
}
