/**
    EurekaJ Profiler - http://eurekaj.haagen.name
    
    Copyright (C) 2010-2011 Joachim Haagen Skeie

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
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
