package org.eurekaj.manager.dao.berkeley;

import java.util.List;

import org.eurekaj.manager.berkeley.alert.TriggeredAlert;
import org.eurekaj.manager.berkeley.statistics.LiveStatistics;
import org.eurekaj.manager.berkeley.treemenu.TreeMenuNode;
import org.eurekaj.manager.perst.alert.Alert;
import org.eurekaj.manager.perst.statistics.GroupedStatistics;
import org.eurekaj.webservice.UnitType;
import org.eurekaj.webservice.ValueType;

public interface TreeMenuDao {

	public void storeIncomingStatistics(String guiPath, Long timeperiod,
			String value, ValueType valueType, UnitType unitType);

	public List<TreeMenuNode> getTreeMenu();

	public TreeMenuNode getTreeMenu(String guiPath);

	public List<LiveStatistics> getLiveStatistics(String guiPath,
			Long minTimeperiod, Long maxTimeperiod);

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
