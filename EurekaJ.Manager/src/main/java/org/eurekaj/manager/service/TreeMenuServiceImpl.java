package org.eurekaj.manager.service;

import java.util.List;

import org.eurekaj.manager.berkeley.statistics.LiveStatistics;
import org.eurekaj.manager.berkeley.treemenu.TreeMenuNode;
import org.eurekaj.manager.dao.berkeley.TreeMenuDao;
import org.eurekaj.manager.perst.alert.Alert;
import org.eurekaj.manager.perst.statistics.GroupedStatistics;

public class TreeMenuServiceImpl implements TreeMenuService {
	private TreeMenuDao treeMenuDao;
	
	public TreeMenuDao getTreeMenuDao() {
		return treeMenuDao;
	}
	
	public void setTreeMenuDao(TreeMenuDao treeMenuDao) {
		this.treeMenuDao = treeMenuDao;
	}
	
	public void storeIncomingStatistics(String guiPath, Long timeperiod, String execTime, String callsPerInterval, String value) {
		treeMenuDao.storeIncomingStatistics(guiPath, timeperiod, execTime, callsPerInterval, value);
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
	
	public GroupedStatistics getGroupedStatistics(String guiPath) {
		return treeMenuDao.getGroupedStatistics(guiPath);
	}
	
	public List<GroupedStatistics> getGroupedStatistics() {
		return treeMenuDao.getGroupedStatistics();
	}

	public Alert getAlert(String guiPath) {
		return treeMenuDao.getAlert(guiPath);
	}

	public void persistAlert(Alert alert) {
		treeMenuDao.persistAlert(alert);
	}
	
	public List<Alert> getAlerts() {
		return treeMenuDao.getAlerts();
	}
}
