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
        setEmailRecipientGroupName(attributeMap.get("smtpServerhost"));
        setEmailRecipientGroupName(attributeMap.get("smtpUsername"));
        setEmailRecipientGroupName(attributeMap.get("smtpPassword"));
        setEmailRecipientGroupName(attributeMap.get("useSSL"));
        setEmailRecipientGroupName(attributeMap.get("port"));

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
