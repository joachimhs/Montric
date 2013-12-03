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

import java.util.Date;
import java.util.List;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.*;
import org.eurekaj.api.datatypes.basic.BasicStatistics;
import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.api.enumtypes.ValueType;
import org.eurekaj.manager.plugin.ManagerDbPluginService;
import org.eurekaj.manager.util.DatabasePluginUtil;
import org.eurekaj.spi.db.EurekaJDBPluginService;

public class TreeMenuServiceImpl implements TreeMenuService {
	private static final Logger log = Logger.getLogger(TreeMenuServiceImpl.class);
    EurekaJDBPluginService dbPlugin = null;

    public TreeMenuServiceImpl() {

    }

    private EurekaJDBPluginService getDbPlugin() {
        if (dbPlugin == null) {
            dbPlugin = ManagerDbPluginService.getInstance().getPluginServiceWithName(DatabasePluginUtil.getDatabasePluginName());
        }

        return dbPlugin;
    }

    public void storeIncomingStatistics(String guiPath, String accountName, Long timeperiod, String value, ValueType valueType, UnitType unitType, Long count) {
		getDbPlugin().getLiveStatissticsDao().storeIncomingStatistics(guiPath, accountName, timeperiod, value, valueType, unitType, count);
		getDbPlugin().getTreeMenuDao().persistTreeMenu(new BasicStatistics(guiPath, accountName, "Y"));
	}
	
	public List<Statistics> getTreeMenu(String accountName) {
		return getDbPlugin().getTreeMenuDao().getTreeMenu(accountName);
	}

	public Statistics getTreeMenu(String guiPath, String accountName) {
		return getDbPlugin().getTreeMenuDao().getTreeMenu(guiPath, accountName);
	}

	public List<LiveStatistics> getLiveStatistics(String guiPath, String accountName,
                                                  Long minTimeperiod, Long maxTimeperiod) {
		return getDbPlugin().getLiveStatissticsDao().getLiveStatistics(guiPath, accountName, minTimeperiod, maxTimeperiod);
	}

	public void persistGroupInstrumentation(GroupedStatistics groupedStatistics) {
		getDbPlugin().getGroupedStatisticsDao().persistGroupInstrumentation(groupedStatistics);
	}
	
	public GroupedStatistics getGroupedStatistics(String name, String accountName) {
		return getDbPlugin().getGroupedStatisticsDao().getGroupedStatistics(name, accountName);
	}
	
	public List<GroupedStatistics> getGroupedStatistics(String accountName) {
		return getDbPlugin().getGroupedStatisticsDao().getGroupedStatistics(accountName);
	}
	
	public void deleteChartGroup(String groupName, String accountName) {
		getDbPlugin().getGroupedStatisticsDao().deleteGroupedChart(groupName, accountName);
	}

	public Alert getAlert(String alertName, String accountName) {
		return getDbPlugin().getAlertDao().getAlert(alertName, accountName);
	}

	public void persistAlert(Alert alert) {
		getDbPlugin().getAlertDao().persistAlert(alert);
	}
	
	public List<Alert> getAlerts(String accountName) {
		return getDbPlugin().getAlertDao().getAlerts(accountName);
	}
	
	public void deleteAlert(String alertName, String accountName) {
		getDbPlugin().getAlertDao().deleteAlert(alertName, accountName);
	}

    public void persistTriggeredAlert(TriggeredAlert triggeredAlert) {
        getDbPlugin().getAlertDao().persistTriggeredAlert(triggeredAlert);
    }

    public List<TriggeredAlert> getTriggeredAlerts(String accountName, Long fromTimeperiod, Long toTimeperiod) {
        return getDbPlugin().getAlertDao().getTriggeredAlerts(accountName, fromTimeperiod, toTimeperiod);
    }

    public List<TriggeredAlert> getTriggeredAlerts(String alertname, String accountName, Long fromTimeperiod, Long toTimeperiod) {
        return getDbPlugin().getAlertDao().getTriggeredAlerts(alertname, accountName, fromTimeperiod, toTimeperiod);
    }

    public List<TriggeredAlert> getRecentTriggeredAlerts(String accountName, int numAlerts) {
        return getDbPlugin().getAlertDao().getRecentTriggeredAlerts(accountName, numAlerts);
    }

    public void deleteOldLiveStatistics(String accountName, Date date) {
        log.debug("dbplugin: " + getDbPlugin());

        getDbPlugin().getLiveStatissticsDao().deleteLiveStatisticsOlderThan(date, accountName);
    }
    
    public void deleteTreeMenuNode(String guiPath, String accountName) {
    	getDbPlugin().getTreeMenuDao().deleteTreeMenu(guiPath, accountName);
    }
}
