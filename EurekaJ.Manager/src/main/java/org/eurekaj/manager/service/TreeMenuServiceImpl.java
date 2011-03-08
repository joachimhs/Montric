package org.eurekaj.manager.service;

import java.util.List;

import org.eurekaj.manager.berkeley.alert.TriggeredAlert;
import org.eurekaj.manager.berkeley.statistics.LiveStatistics;
import org.eurekaj.manager.berkeley.treemenu.TreeMenuNode;
import org.eurekaj.manager.dao.berkeley.TreeMenuDao;
import org.eurekaj.manager.perst.alert.Alert;
import org.eurekaj.manager.perst.statistics.GroupedStatistics;
import org.eurekaj.webservice.UnitType;
import org.eurekaj.webservice.ValueType;

public class TreeMenuServiceImpl implements TreeMenuService {
	private TreeMenuDao treeMenuDao;
	
	public TreeMenuDao getTreeMenuDao() {
		return treeMenuDao;
	}
	
	public void setTreeMenuDao(TreeMenuDao treeMenuDao) {
		this.treeMenuDao = treeMenuDao;
	}
	
	public void storeIncomingStatistics(String guiPath, Long timeperiod, String value, ValueType valueType, UnitType unitType) {
		treeMenuDao.storeIncomingStatistics(guiPath, timeperiod, value, valueType, unitType);
	}
	
	public List<TreeMenuNode> getTreeMenu() {
		return treeMenuDao.getTreeMenu();
	}

	public TreeMenuNode getTreeMenu(String guiPath) {
		return treeMenuDao.getTreeMenu(guiPath);
	}

	public List<LiveStatistics> getLiveStatistics(String guiPath,
			Long minTimeperiod, Long maxTimeperiod) {
		return treeMenuDao.getLiveStatistics(guiPath, minTimeperiod, maxTimeperiod);
	}

	public void persistGroupInstrumentation(GroupedStatistics groupedStatistics) {
		treeMenuDao.persistGroupInstrumentation(groupedStatistics);		
	}
	
	public GroupedStatistics getGroupedStatistics(String name) {
		return treeMenuDao.getGroupedStatistics(name);
	}
	
	public List<GroupedStatistics> getGroupedStatistics() {
		return treeMenuDao.getGroupedStatistics();
	}

	public Alert getAlert(String alertName) {
		return treeMenuDao.getAlert(alertName);
	}

	public void persistAlert(Alert alert) {
		treeMenuDao.persistAlert(alert);
	}
	
	public List<Alert> getAlerts() {
		return treeMenuDao.getAlerts();
	}

    @Override
    public void persistTriggeredAlert(TriggeredAlert triggeredAlert) {
        treeMenuDao.persistTriggeredAlert(triggeredAlert);
    }

    @Override
    public List<TriggeredAlert> getTriggeredAlerts(Long fromTimeperiod, Long toTimeperiod) {
        return treeMenuDao.getTriggeredAlerts(fromTimeperiod, toTimeperiod);
    }

    @Override
    public List<TriggeredAlert> getTriggeredAlerts(String alertname, Long fromTimeperiod, Long toTimeperiod) {
        return treeMenuDao.getTriggeredAlerts(alertname, fromTimeperiod, toTimeperiod);
    }

    @Override
    public List<TriggeredAlert> getRecentTriggeredAlerts(int numAlerts) {
        return treeMenuDao.getRecentTriggeredAlerts(numAlerts);
    }
}
