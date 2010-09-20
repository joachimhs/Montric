package org.eurekaj.manager.service;

import java.util.List;

import org.eurekaj.manager.berkeley.statistics.LiveStatistics;
import org.eurekaj.manager.berkeley.treemenu.TreeMenuNode;
import org.eurekaj.manager.perst.alert.Alert;
import org.eurekaj.manager.perst.statistics.GroupedStatistics;

public interface TreeMenuService {

	public void storeIncomingStatistics(String guiPath, Long timeperiod, String execTime, String callsPerInterval, String value);
	
	public List<TreeMenuNode> getTreeMenu();
	
	public TreeMenuNode getTreeMenu(String guiPath);
	
	public List<LiveStatistics> getLiveStatistics(String guiPath, Long minTimeperiod, Long maxTimeperiod);
	
	public void persistGroupInstrumentation(GroupedStatistics groupedStatistics);
	
	public GroupedStatistics getGroupedStatistics(String guiPath);
	
	public List<GroupedStatistics> getGroupedStatistics();
	
	public void persistAlert(Alert alert);
	
	public Alert getAlert(String guiPath);
	
	public List<Alert> getAlerts();
}
