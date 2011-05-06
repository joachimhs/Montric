package org.eurekaj.berkeley.db.datatypes;

import java.util.ArrayList;
import java.util.List;

import com.sleepycat.persist.model.Entity;
import com.sleepycat.persist.model.PrimaryKey;
import org.eurekaj.api.datatypes.EmailRecipientGroup;

@Entity(version=1)
public class BerkeleyEmailRecipientGroup implements Comparable<BerkeleyEmailRecipientGroup>, EmailRecipientGroup {
	@PrimaryKey private String emailRecipientGroupName;
	private String smtpServerhost;
	private String smtpUsername;
	private String smtpPassword;
	private boolean useSSL;
	private Integer port = 25;
	private List<String> emailRecipientList = new ArrayList<String>();

    public BerkeleyEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup) {
        this.emailRecipientGroupName = emailRecipientGroup.getEmailRecipientGroupName();
        this.smtpServerhost = emailRecipientGroup.getSmtpServerhost();
        this.smtpUsername = emailRecipientGroup.getSmtpUsername();
        this.smtpPassword = emailRecipientGroup.getSmtpPassword();
        this.useSSL = emailRecipientGroup.isUseSSL();
        this.port = emailRecipientGroup.getPort();
        this.emailRecipientList = emailRecipientGroup.getEmailRecipientList();
    }

    public BerkeleyEmailRecipientGroup() {
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
	public int compareTo(BerkeleyEmailRecipientGroup other) {
		if (other == null || other.getEmailRecipientGroupName() == null) {
			return 1;
		}
		
		if (this.getEmailRecipientGroupName() == null) {
			return -1;
		}
		
		return this.getEmailRecipientGroupName().compareTo(other.getEmailRecipientGroupName());
	}

}
