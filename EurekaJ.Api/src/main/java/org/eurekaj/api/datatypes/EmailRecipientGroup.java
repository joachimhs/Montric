package org.eurekaj.api.datatypes;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/6/11
 * Time: 12:35 AM
 * To change this template use File | Settings | File Templates.
 */
public interface EmailRecipientGroup {

    public String getEmailRecipientGroupName();

	public String getSmtpServerhost();

	public String getSmtpUsername();

	public String getSmtpPassword();

	public boolean isUseSSL();

	public Integer getPort();

	public List<String> getEmailRecipientList();

}
