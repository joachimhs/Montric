package org.eurekaj.manager.dao.berkeley;

import java.util.List;

import org.eurekaj.manager.berkley.administration.EmailRecipientGroup;

public interface AdministrationDao {

	public List<EmailRecipientGroup> getEmailRecipientGroups();
	
	public EmailRecipientGroup getEmailRecipientGroup(String groupName);
	
	public void persistEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup);
	
	public void deleteEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup);
}
