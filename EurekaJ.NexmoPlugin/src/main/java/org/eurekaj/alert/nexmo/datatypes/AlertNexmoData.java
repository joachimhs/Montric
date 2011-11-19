package org.eurekaj.alert.nexmo.datatypes;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

public class AlertNexmoData {
	private String username;
	private String password;
	private String from;
	private List<String> recipientList;

	public AlertNexmoData(Properties nexmoProperties) {
		super();
		this.username = nexmoProperties
				.getProperty("org.eurekaj.plugin.alert.nexmoPlugin.username");
		this.password = nexmoProperties
				.getProperty("org.eurekaj.plugin.alert.nexmoPlugin.password");
		this.from = nexmoProperties
				.getProperty("org.eurekaj.plugin.alert.nexmoPlugin.from");

		String toString = nexmoProperties
				.getProperty("org.eurekaj.plugin.alert.nexmoPlugin.to");

		String[] tos = toString.split(",");
		this.recipientList = new ArrayList<String>();
		for (String to : tos) {
			recipientList.add(to);
		}
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getFrom() {
		return from;
	}

	public void setFrom(String from) {
		this.from = from;
	}

	public List<String> getRecipientList() {
		return recipientList;
	}
	
	public void setRecipientList(List<String> recipientList) {
		this.recipientList = recipientList;
	}

}
