package org.eurekaj.manager.service;

import java.util.List;

import org.eurekaj.manager.berkley.administration.EmailRecipientGroup;

public interface AdministrationService {

	public List<EmailRecipientGroup> getEmailRecipientGroups();
	
	public EmailRecipientGroup getEmailRecipientGroup(String groupName);
	
	public void persistEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup);
	
	public void deleteEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup);
	
}
