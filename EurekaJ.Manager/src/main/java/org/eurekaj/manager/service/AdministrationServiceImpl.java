package org.eurekaj.manager.service;

import java.util.List;

import org.eurekaj.manager.berkley.administration.EmailRecipientGroup;
import org.eurekaj.manager.dao.berkeley.AdministrationDao;

public class AdministrationServiceImpl implements AdministrationService {
	private AdministrationDao administrationDao;

	public AdministrationDao getAdministrationDao() {
		return administrationDao;
	}

	public void setAdministrationDao(AdministrationDao administrationDao) {
		this.administrationDao = administrationDao;
	}

	@Override
	public List<EmailRecipientGroup> getEmailRecipientGroups() {
		return administrationDao.getEmailRecipientGroups();
	}

	@Override
	public EmailRecipientGroup getEmailRecipientGroup(String groupName) {
		return administrationDao.getEmailRecipientGroup(groupName);
	}

	@Override
	public void persistEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup) {
		administrationDao.persistEmailRecipientGroup(emailRecipientGroup);
	}

	@Override
	public void deleteEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup) {
		administrationDao.deleteEmailRecipientGroup(emailRecipientGroup);		
	}
}
