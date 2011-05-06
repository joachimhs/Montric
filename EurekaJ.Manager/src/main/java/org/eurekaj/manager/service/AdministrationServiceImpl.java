package org.eurekaj.manager.service;

import java.util.List;

import org.eurekaj.api.dao.SmtpDao;
import org.eurekaj.api.datatypes.EmailRecipientGroup;
import org.eurekaj.manager.plugin.ManagerDbPluginService;
import org.eurekaj.spi.db.EurekaJDBPluginService;

public class AdministrationServiceImpl implements AdministrationService {
    EurekaJDBPluginService dbPlugin;

    public AdministrationServiceImpl() {
        dbPlugin = ManagerDbPluginService.getInstance().getPluginServiceWithName("Berkeley");
    }

    @Override
	public List<EmailRecipientGroup> getEmailRecipientGroups() {
		return dbPlugin.getSmtpDao().getEmailRecipientGroups();
	}

	@Override
	public EmailRecipientGroup getEmailRecipientGroup(String groupName) {
		return dbPlugin.getSmtpDao().getEmailRecipientGroup(groupName);
	}

	@Override
	public void persistEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup) {
		dbPlugin.getSmtpDao().persistEmailRecipientGroup(emailRecipientGroup);
	}

	@Override
	public void deleteEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup) {
		dbPlugin.getSmtpDao().deleteEmailRecipientGroup(emailRecipientGroup);
	}
}
