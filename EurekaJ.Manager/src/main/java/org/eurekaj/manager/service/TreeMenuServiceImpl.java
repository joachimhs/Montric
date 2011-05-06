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
import org.eurekaj.spi.db.EurekaJDBPluginService;

public class TreeMenuServiceImpl implements TreeMenuService {
    EurekaJDBPluginService dbPlugin;

    public TreeMenuServiceImpl() {
        dbPlugin = ManagerDbPluginService.getInstance().getPluginServiceWithName("Berkeley");
    }

    public void storeIncomingStatistics(String guiPath, Long timeperiod, String value, ValueType valueType, UnitType unitType) {
		dbPlugin.getLiveStatissticsDao().storeIncomingStatistics(guiPath, timeperiod, value, valueType, unitType);
	}
	
	public List<TreeMenuNode> getTreeMenu() {
		return dbPlugin.getTreeMenuDao().getTreeMenu();
	}

	public TreeMenuNode getTreeMenu(String guiPath) {
		return dbPlugin.getTreeMenuDao().getTreeMenu(guiPath);
	}

	public List<LiveStatistics> getLiveStatistics(String guiPath,
                                                  Long minTimeperiod, Long maxTimeperiod) {
		return dbPlugin.getLiveStatissticsDao().getLiveStatistics(guiPath, minTimeperiod, maxTimeperiod);
	}

	public void persistGroupInstrumentation(GroupedStatistics groupedStatistics) {
		dbPlugin.getGroupedStatisticsDao().persistGroupInstrumentation(groupedStatistics);
	}
	
	public GroupedStatistics getGroupedStatistics(String name) {
		return dbPlugin.getGroupedStatisticsDao().getGroupedStatistics(name);
	}
	
	public List<GroupedStatistics> getGroupedStatistics() {
		return dbPlugin.getGroupedStatisticsDao().getGroupedStatistics();
	}

	public Alert getAlert(String alertName) {
		return dbPlugin.getAlertDao().getAlert(alertName);
	}

	public void persistAlert(Alert alert) {
		dbPlugin.getAlertDao().persistAlert(alert);
	}
	
	public List<Alert> getAlerts() {
		return dbPlugin.getAlertDao().getAlerts();
	}

    @Override
    public void persistTriggeredAlert(TriggeredAlert triggeredAlert) {
        dbPlugin.getAlertDao().persistTriggeredAlert(triggeredAlert);
    }

    @Override
    public List<TriggeredAlert> getTriggeredAlerts(Long fromTimeperiod, Long toTimeperiod) {
        return dbPlugin.getAlertDao().getTriggeredAlerts(fromTimeperiod, toTimeperiod);
    }

    @Override
    public List<TriggeredAlert> getTriggeredAlerts(String alertname, Long fromTimeperiod, Long toTimeperiod) {
        return dbPlugin.getAlertDao().getTriggeredAlerts(alertname, fromTimeperiod, toTimeperiod);
    }

    @Override
    public List<TriggeredAlert> getRecentTriggeredAlerts(int numAlerts) {
        return dbPlugin.getAlertDao().getRecentTriggeredAlerts(numAlerts);
    }
}
