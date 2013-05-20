package org.eurekaj.alert.email.datatypes;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.EmailRecipientGroup;

public class AlertEmailRecipientGroup implements EmailRecipientGroup {
	private static final Logger log = Logger.getLogger(AlertEmailRecipientGroup.class);
	private String emailRecipientGroupName;
    private String accountName;
	private String smtpServerhost;
	private String smtpUsername;
	private String smtpPassword;
	private boolean useSSL;
	private Integer port = 25;
	private List<String> emailRecipientList = new ArrayList<String>();
	
	public AlertEmailRecipientGroup() {
	}

	@Override
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

    @Override
	public String getSmtpServerhost() {
		return smtpServerhost;
	}

	public void setSmtpServerhost(String smtpServerhost) {
		this.smtpServerhost = smtpServerhost;
	}

	@Override
	public String getSmtpUsername() {
		return smtpUsername;
	}

	public void setSmtpUsername(String smtpUsername) {
		this.smtpUsername = smtpUsername;
	}

	@Override
	public String getSmtpPassword() {
		return smtpPassword;
	}

	public void setSmtpPassword(String smtpPassword) {
		this.smtpPassword = smtpPassword;
	}

	@Override
	public boolean isUseSSL() {
		return useSSL;
	}

	public void setUseSSL(boolean useSSL) {
		this.useSSL = useSSL;
	}

	@Override
	public Integer getPort() {
		return port;
	}

	public void setPort(Integer port) {
		this.port = port;
	}

	@Override
	public List<String> getEmailRecipientList() {
		return emailRecipientList;
	}

	public void setEmailRecipientList(List<String> emailRecipientList) {
		this.emailRecipientList = emailRecipientList;
	}
	
	
}
