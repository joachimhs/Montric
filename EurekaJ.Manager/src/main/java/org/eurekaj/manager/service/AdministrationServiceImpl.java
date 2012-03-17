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
	
	public void deleteEmailRecipientGroup(String emailRecipientGroupName) {
		getDbPlugin().getSmtpDao().deleteEmailRecipientGroup(emailRecipientGroupName);
	}
}
