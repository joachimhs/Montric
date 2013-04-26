package org.eurekaj.api.datatypes.basic;

import java.util.ArrayList;
import java.util.List;

import org.eurekaj.api.datatypes.EmailRecipientGroup;

public class BasicEmailRecipientGroup implements EmailRecipientGroup, Comparable<EmailRecipientGroup> {
	private String emailRecipientGroupName;
	private String accountName;
	private String smtpServerhost;
	private String smtpUsername;
	private String smtpPassword;
	private boolean useSSL;
	private Integer port = 25;
	private List<String> emailRecipientList = new ArrayList<String>();
	
	public BasicEmailRecipientGroup() {
		super();
	}

	public BasicEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup) {
		this(emailRecipientGroup.getEmailRecipientGroupName(), emailRecipientGroup.getAccountName(),
				emailRecipientGroup.getSmtpServerhost(), emailRecipientGroup.getSmtpUsername(),
				emailRecipientGroup.getSmtpPassword(), emailRecipientGroup.isUseSSL(), emailRecipientGroup.getPort(),
				emailRecipientGroup.getEmailRecipientList());
		
	}
	
	public BasicEmailRecipientGroup(String emailRecipientGroupName,
			String accountName, String smtpServerhost, String smtpUsername,
			String smtpPassword, boolean useSSL, Integer port,
			List<String> emailRecipientList) {
		super();
		this.emailRecipientGroupName = emailRecipientGroupName;
		this.accountName = accountName;
		this.smtpServerhost = smtpServerhost;
		this.smtpUsername = smtpUsername;
		this.smtpPassword = smtpPassword;
		this.useSSL = useSSL;
		this.port = port;
		this.emailRecipientList = emailRecipientList;
	}

	public String getEmailRecipientGroupName() {
		return emailRecipientGroupName;
	}

	public void setEmailRecipientGroupName(String emailRecipientGroupName) {
		this.emailRecipientGroupName = emailRecipientGroupName;
	}

	public String getAccountName() {
		return accountName;
	}

	public void setAccountName(String accountName) {
		this.accountName = accountName;
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
