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

import org.eurekaj.api.datatypes.*;
import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.api.enumtypes.ValueType;

public interface TreeMenuService {

	public void storeIncomingStatistics(String guiPath, String accountName, Long timeperiod, String value, ValueType valueType, UnitType unitType);
	
	public List<Statistics> getTreeMenu();
	
	public Statistics getTreeMenu(String guiPath, String accountName);
	
	public List<LiveStatistics> getLiveStatistics(String guiPath, String accountName, Long minTimeperiod, Long maxTimeperiod);
	
	public void persistGroupInstrumentation(GroupedStatistics groupedStatistics);
	
	public GroupedStatistics getGroupedStatistics(String name, String accountName);
	
	public List<GroupedStatistics> getGroupedStatistics();
	
	public void deleteChartGroup(String groupName, String accountName);
	
	public void persistAlert(Alert alert);
	
	public Alert getAlert(String alertName, String accountName);
	
	public List<Alert> getAlerts();

	public void deleteAlert(String alertName, String accountName);
	
    public void persistTriggeredAlert(TriggeredAlert triggeredAlert);

    public List<TriggeredAlert> getTriggeredAlerts(String accountName, Long fromTimeperiod, Long toTimeperiod);

    public List<TriggeredAlert> getTriggeredAlerts(String alertname, String accountName, Long fromTimeperiod, Long toTimeperiod);

    public List<TriggeredAlert> getRecentTriggeredAlerts(String accountName, int numAlerts);

    public void deleteOldLiveStatistics(String accountName, Date date);
    
    public void deleteTreeMenuNode(String guiPath, String accountName);
}
