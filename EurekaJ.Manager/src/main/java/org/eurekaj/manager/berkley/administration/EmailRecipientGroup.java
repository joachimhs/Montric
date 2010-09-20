package org.eurekaj.manager.berkley.administration;

import java.util.ArrayList;
import java.util.List;

import com.sleepycat.persist.model.Entity;
import com.sleepycat.persist.model.PrimaryKey;

@Entity(version=1)
public class EmailRecipientGroup implements Comparable<EmailRecipientGroup> {
	@PrimaryKey private String emailRecipientGroupName;
	private String smtpServerhost;
	private String smtpUsername;
	private String smtpPassword;
	private boolean useSSL;
	private Integer port = 25;
	private List<String> emailRecipientList = new ArrayList<String>();
	
	public EmailRecipientGroup() {
		super();
	}
	
	
	
	public String getEmailRecipientGroupName() {
		return emailRecipientGroupName;
	}



	public void setEmailRecipientGroupName(String emailRecipientGroupName) {
		this.emailRecipientGroupName = emailRecipientGroupName;
	}



	public String getSmtpServerhost() {
		return smtpServerhost;
	}



	public void setSmtpServerhost(String smtpServerhost) {
		this.smtpServerhost = smtpServerhost;
	}



	public String getSmtpUsername() {
		return smtpUsername;
	}



	public void setSmtpUsername(String smtpUsername) {
		this.smtpUsername = smtpUsername;
	}



	public String getSmtpPassword() {
		return smtpPassword;
	}



	public void setSmtpPassword(String smtpPassword) {
		this.smtpPassword = smtpPassword;
	}



	public boolean isUseSSL() {
		return useSSL;
	}



	public void setUseSSL(boolean useSSL) {
		this.useSSL = useSSL;
	}



	public Integer getPort() {
		return port;
	}



	public void setPort(Integer port) {
		this.port = port;
	}



	public List<String> getEmailRecipientList() {
		return emailRecipientList;
	}



	public void setEmailRecipientList(List<String> emailRecipientList) {
		this.emailRecipientList = emailRecipientList;
	}



	@Override
	public int compareTo(EmailRecipientGroup other) {
		if (other == null || other.getEmailRecipientGroupName() == null) {
			return 1;
		}
		
		if (this.getEmailRecipientGroupName() == null) {
			return -1;
		}
		
		return this.getEmailRecipientGroupName().compareTo(other.getEmailRecipientGroupName());
	}

}
