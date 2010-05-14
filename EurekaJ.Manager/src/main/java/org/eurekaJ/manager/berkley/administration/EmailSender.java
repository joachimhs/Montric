package org.eurekaJ.manager.berkley.administration;

import java.util.ArrayList;
import java.util.List;

import com.sleepycat.persist.model.Entity;
import com.sleepycat.persist.model.PrimaryKey;

@Entity(version=0)
public class EmailSender {
	@PrimaryKey private String emailSenderName;
	private String emailServer;
	private List<String> emailReceivers = new ArrayList<String>();
	
	public EmailSender() {
		super();
	}
	
	public List<String> getEmailReceivers() {
		return emailReceivers;
	}
	
	public void setEmailReceivers(List<String> emailReceivers) {
		this.emailReceivers = emailReceivers;
	}
	
	public String getEmailSenderName() {
		return emailSenderName;
	}
	
	public void setEmailSenderName(String emailSenderName) {
		this.emailSenderName = emailSenderName;
	}
	
	public String getEmailServer() {
		return emailServer;
	}
	
	public void setEmailServer(String emailServer) {
		this.emailServer = emailServer;
	}
}
