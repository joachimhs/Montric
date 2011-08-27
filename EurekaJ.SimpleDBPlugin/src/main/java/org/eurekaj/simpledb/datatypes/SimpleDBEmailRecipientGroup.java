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
package org.eurekaj.simpledb.datatypes;

import com.amazonaws.services.simpledb.model.Attribute;
import com.amazonaws.services.simpledb.model.ReplaceableAttribute;
import org.eurekaj.api.datatypes.EmailRecipientGroup;
import org.eurekaj.simpledb.SimpleDBUtil;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 5/7/11
 * Time: 11:40 AM
 * To change this template use File | Settings | File Templates.
 */
public class SimpleDBEmailRecipientGroup implements Comparable<EmailRecipientGroup>, EmailRecipientGroup {
    private String emailRecipientGroupName;
	private String smtpServerhost;
	private String smtpUsername;
	private String smtpPassword;
	private boolean useSSL;
	private Integer port = 25;
	private List<String> emailRecipientList = new ArrayList<String>();

    public SimpleDBEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup) {
        this.emailRecipientGroupName = emailRecipientGroup.getEmailRecipientGroupName();
        this.smtpServerhost = emailRecipientGroup.getSmtpServerhost();
        this.smtpUsername = emailRecipientGroup.getSmtpUsername();
        this.smtpPassword = emailRecipientGroup.getSmtpPassword();
        this.useSSL = emailRecipientGroup.isUseSSL();
        this.port = emailRecipientGroup.getPort();
        this.emailRecipientList = emailRecipientGroup.getEmailRecipientList();
    }

    public SimpleDBEmailRecipientGroup(List<Attribute> attributeList) {
        Map<String, String> attributeMap = SimpleDBUtil.getAttributesAStringMap(attributeList);

        setEmailRecipientGroupName(attributeMap.get("emailRecipientGroupName"));
        setSmtpServerhost(attributeMap.get("smtpServerhost"));
        setSmtpUsername(attributeMap.get("smtpUsername"));
        setSmtpPassword(attributeMap.get("smtpPassword"));
        setUseSSL(attributeMap.get("useSSL"));
        setPort(attributeMap.get("port"));

        setEmailRecipientList(SimpleDBUtil.getCommaseperatedStringAsList(attributeMap.get("emailRecipientList"), ","));
    }

    public List<ReplaceableAttribute> getAmazonSimpleDBAttribute() {
        List<ReplaceableAttribute> replaceableAttributeList = new ArrayList<ReplaceableAttribute>();
        replaceableAttributeList.add(new ReplaceableAttribute("emailRecipientGroupName", this.getEmailRecipientGroupName(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("smtpServerhost", this.getSmtpServerhost(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("smtpUsername", this.getSmtpUsername(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("smtpPassword", this.getSmtpPassword(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("useSSL", new Boolean(this.isUseSSL()).toString(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("port", this.getPort().toString(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("emailRecipientList", SimpleDBUtil.getStringListAsString(this.getEmailRecipientList()), true));

        return replaceableAttributeList;
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

    public void setUseSSL(String useSSL) {
        this.useSSL = new Boolean(useSSL);
    }

    public Integer getPort() {
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public void setPort(String port) {
         if (port == null) {
            this.port = 25;
        } else {
            try {
                this.port = Integer.parseInt(port);
            } catch (NumberFormatException nfe) {
                this.port = 25;
            }
        }
    }

    public List<String> getEmailRecipientList() {
        return emailRecipientList;
    }

    public void setEmailRecipientList(List<String> emailRecipientList) {
        this.emailRecipientList = emailRecipientList;
    }

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
