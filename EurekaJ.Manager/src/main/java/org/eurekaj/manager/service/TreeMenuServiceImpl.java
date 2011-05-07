package org.eurekaj.manager.service;

import java.util.List;

import org.eurekaj.api.dao.AlertDao;
import org.eurekaj.api.dao.GroupedStatisticsDao;
import org.eurekaj.api.dao.LiveStatisticsDao;
import org.eurekaj.api.dao.TreeMenuDao;
import org.eurekaj.api.datatypes.*;
import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.api.enumtypes.ValueType;
import org.eurekaj.manager.plugin.ManagerDbPluginService;
import org.eurekaj.manager.util.DatabasePluginUtil;
import org.eurekaj.spi.db.EurekaJDBPluginService;

public class TreeMenuServiceImpl implements TreeMenuService {
    EurekaJDBPluginService dbPlugin = null;

    public TreeMenuServiceImpl() {

    }

    private EurekaJDBPluginService getDbPlugin() {

        if (dbPlugin == null) {
            dbPlugin = ManagerDbPluginService.getInstance().getPluginServiceWithName(DatabasePluginUtil.getDatabasePluginName());
        }

        return dbPlugin;
    }

    public void storeIncomingStatistics(String guiPath, Long timeperiod, String value, ValueType valueType, UnitType unitType) {
		getDbPlugin().getLiveStatissticsDao().storeIncomingStatistics(guiPath, timeperiod, value, valueType, unitType);
	}
	
	public List<TreeMenuNode> getTreeMenu() {
		return getDbPlugin().getTreeMenuDao().getTreeMenu();
	}

	public TreeMenuNode getTreeMenu(String guiPath) {
		return getDbPlugin().getTreeMenuDao().getTreeMenu(guiPath);
	}

	public List<LiveStatistics> getLiveStatistics(String guiPath,
                                                  Long minTimeperiod, Long maxTimeperiod) {
		return getDbPlugin().getLiveStatissticsDao().getLiveStatistics(guiPath, minTimeperiod, maxTimeperiod);
	}

	public void persistGroupInstrumentation(GroupedStatistics groupedStatistics) {
		getDbPlugin().getGroupedStatisticsDao().persistGroupInstrumentation(groupedStatistics);
	}
	
	public GroupedStatistics getGroupedStatistics(String name) {
		return getDbPlugin().getGroupedStatisticsDao().getGroupedStatistics(name);
	}
	
	public List<GroupedStatistics> getGroupedStatistics() {
		return getDbPlugin().getGroupedStatisticsDao().getGroupedStatistics();
	}

	public Alert getAlert(String alertName) {
		return getDbPlugin().getAlertDao().getAlert(alertName);
	}

	public void persistAlert(Alert alert) {
		getDbPlugin().getAlertDao().persistAlert(alert);
	}
	
	public List<Alert> getAlerts() {
		return getDbPlugin().getAlertDao().getAlerts();
	}

    public void persistTriggeredAlert(TriggeredAlert triggeredAlert) {
        getDbPlugin().getAlertDao().persistTriggeredAlert(triggeredAlert);
    }

    public List<TriggeredAlert> getTriggeredAlerts(Long fromTimeperiod, Long toTimeperiod) {
        return getDbPlugin().getAlertDao().getTriggeredAlerts(fromTimeperiod, toTimeperiod);
    }

    public List<TriggeredAlert> getTriggeredAlerts(String alertname, Long fromTimeperiod, Long toTimeperiod) {
        return getDbPlugin().getAlertDao().getTriggeredAlerts(alertname, fromTimeperiod, toTimeperiod);
    }

    public List<TriggeredAlert> getRecentTriggeredAlerts(int numAlerts) {
        return getDbPlugin().getAlertDao().getRecentTriggeredAlerts(numAlerts);
    }
}
