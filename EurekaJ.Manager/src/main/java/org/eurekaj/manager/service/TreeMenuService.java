package org.eurekaj.manager.service;

import java.util.List;

import org.eurekaj.api.datatypes.*;
import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.api.enumtypes.ValueType;

public interface TreeMenuService {

	public void storeIncomingStatistics(String guiPath, Long timeperiod, String value, ValueType valueType, UnitType unitType);
	
	public List<TreeMenuNode> getTreeMenu();
	
	public TreeMenuNode getTreeMenu(String guiPath);
	
	public List<LiveStatistics> getLiveStatistics(String guiPath, Long minTimeperiod, Long maxTimeperiod);
	
	public void persistGroupInstrumentation(GroupedStatistics groupedStatistics);
	
	public GroupedStatistics getGroupedStatistics(String name);
	
	public List<GroupedStatistics> getGroupedStatistics();
	
	public void persistAlert(Alert alert);
	
	public Alert getAlert(String alertName);
	
	public List<Alert> getAlerts();

    public void persistTriggeredAlert(TriggeredAlert triggeredAlert);

    public List<TriggeredAlert> getTriggeredAlerts(Long fromTimeperiod, Long toTimeperiod);

    public List<TriggeredAlert> getTriggeredAlerts(String alertname, Long fromTimeperiod, Long toTimeperiod);

    public List<TriggeredAlert> getRecentTriggeredAlerts(int numAlerts);
}
