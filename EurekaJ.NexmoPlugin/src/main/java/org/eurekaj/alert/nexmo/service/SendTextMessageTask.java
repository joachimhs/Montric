package org.eurekaj.alert.nexmo.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;

import org.eurekaj.alert.nexmo.datatypes.AlertNexmoData;
import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.enumtypes.AlertStatus;

public class SendTextMessageTask implements Runnable {
	private Alert alert;
	private AlertStatus oldStatus;
	private double currValue;
	private String timeString;
	private AlertNexmoData alertNexmoData;
	
	
	public SendTextMessageTask(Alert alert, AlertStatus oldStatus,
			double currValue, String timeString, AlertNexmoData alertNexmoData) {
		super();
		this.alert = alert;
		this.oldStatus = oldStatus;
		this.currValue = currValue;
		this.timeString = timeString;
		this.alertNexmoData = alertNexmoData;
	}


	@Override
	public void run() {
		System.out.println("SendTextMessageTask run()");
		for (String recipient : alertNexmoData.getRecipientList()) {
			System.out.println("SendTextMessageTask run(): trying recipient: " + recipient);
			try {
				String requestString = buildRequestString(recipient);
				String responseText = "";
				URLConnection connection = new URL("https://rest.nexmo.com/sms/json?" + requestString).openConnection();
				InputStream response = connection.getInputStream();
				BufferedReader reader = null;
			    try {
			        reader = new BufferedReader(new InputStreamReader(response));
			        for (String line; (line = reader.readLine()) != null;) {
			            responseText += line + "\n";
			        }
			        
			        System.out.println("Response: " + responseText);
			    } finally {
			        if (reader != null) try { reader.close(); } catch (IOException logOrIgnore) {}
			    }
			} catch (IOException ioe) {
				ioe.printStackTrace();
			}
		}
		
		
	}
	
	private String buildRequestString(String recipient) throws UnsupportedEncodingException {
		String query = String.format("username=%s&password=%s&from=%s&to=%s&text=%s", 
			     URLEncoder.encode(alertNexmoData.getUsername(), "UTF-8"),
			     URLEncoder.encode(alertNexmoData.getPassword(), "UTF-8"),
			     URLEncoder.encode(alertNexmoData.getFrom(), "UTF-8"),
			     URLEncoder.encode(recipient, "UTF-8"),
			     URLEncoder.encode(buildTextMessage(), "UTF-8"));

		System.out.println("requestString: " + query);
		return query;
	}
	
	private String buildTextMessage() {
		StringBuffer message = new StringBuffer();
		message.append("EurekaJ Alert: ").append(alert.getGuiPath()).append(" Has changed status from ").append(oldStatus.getStatusName()).append(" to status ")
				.append(alert.getStatus().getStatusName()).append(".\n Current Value: ").append(currValue).append(".\n Warning Value: ").append(alert.getWarningValue()).append(".\n Critical Value: ")
				.append(alert.getErrorValue()).append(".\n Time: ").append(timeString);
		
		return message.toString();
	}

}
