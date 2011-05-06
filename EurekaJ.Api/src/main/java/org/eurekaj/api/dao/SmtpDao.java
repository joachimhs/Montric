package org.eurekaj.api.dao;

import org.eurekaj.api.datatypes.EmailRecipientGroup;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/5/11
 * Time: 9:34 PM
 * To change this template use File | Settings | File Templates.
 */
public interface SmtpDao {

    public List<EmailRecipientGroup> getEmailRecipientGroups();

	public EmailRecipientGroup getEmailRecipientGroup(String groupName);

	public void persistEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup);

	public void deleteEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup);
}
