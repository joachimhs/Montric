package org.eurekaj.manager.service;

import java.util.List;

import org.eurekaj.api.dao.SmtpDao;
import org.eurekaj.api.datatypes.EmailRecipientGroup;
import org.eurekaj.manager.plugin.ManagerDbPluginService;
import org.eurekaj.manager.util.DatabasePluginUtil;
import org.eurekaj.spi.db.EurekaJDBPluginService;

public class AdministrationServiceImpl implements AdministrationService {
    EurekaJDBPluginService dbPlugin = null;

    public AdministrationServiceImpl() {

    }

    private EurekaJDBPluginService getDbPlugin() {
        if (dbPlugin == null) {
            dbPlugin = ManagerDbPluginService.getInstance().getPluginServiceWithName(DatabasePluginUtil.getDatabasePluginName());
        }

        return dbPlugin;
    }

	public List<EmailRecipientGroup> getEmailRecipientGroups() {
		return getDbPlugin().getSmtpDao().getEmailRecipientGroups();
	}

	public EmailRecipientGroup getEmailRecipientGroup(String groupName) {
		return getDbPlugin().getSmtpDao().getEmailRecipientGroup(groupName);
	}

	public void persistEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup) {
		getDbPlugin().getSmtpDao().persistEmailRecipientGroup(emailRecipientGroup);
	}

	public void deleteEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup) {
		getDbPlugin().getSmtpDao().deleteEmailRecipientGroup(emailRecipientGroup);
	}
}
