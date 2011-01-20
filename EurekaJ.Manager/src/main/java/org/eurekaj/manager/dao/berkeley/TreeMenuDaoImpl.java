package org.eurekaj.manager.dao.berkeley;

import java.util.ArrayList;
import java.util.List;

import org.eurekaj.manager.berkeley.BerkeleyDbEnv;
import org.eurekaj.manager.berkeley.statistics.LiveStatistics;
import org.eurekaj.manager.berkeley.statistics.LiveStatisticsPk;
import org.eurekaj.manager.berkeley.treemenu.TreeMenuNode;
import org.eurekaj.manager.perst.alert.Alert;
import org.eurekaj.manager.perst.statistics.GroupedStatistics;

import com.sleepycat.persist.EntityCursor;
import com.sleepycat.persist.PrimaryIndex;

public class TreeMenuDaoImpl implements TreeMenuDao {
	private BerkeleyDbEnv dbEnvironment;
	private PrimaryIndex<String, TreeMenuNode> treeMenuPrimaryIdx;
	//statIndex = db.<LiveStatistics>createMultidimensionalIndex(LiveStatistics.class, new String[] {"guiPath", "timeperiod"}, true);
	private PrimaryIndex<LiveStatisticsPk, LiveStatistics> liveStatPrimaryIdx;
	private PrimaryIndex<String, GroupedStatistics> groupedStatPrimaryIdx;
	private PrimaryIndex<String, Alert> alertPrimaryIdx;
	
	
	public void setDbEnvironment(BerkeleyDbEnv dbEnvironment) {
		this.dbEnvironment = dbEnvironment;
		treeMenuPrimaryIdx = this.dbEnvironment.getTreeMenuStore().getPrimaryIndex(String.class, TreeMenuNode.class);
		liveStatPrimaryIdx = this.dbEnvironment.getLiveStatisticsStore().getPrimaryIndex(LiveStatisticsPk.class, LiveStatistics.class);
		groupedStatPrimaryIdx = this.dbEnvironment.getTreeMenuStore().getPrimaryIndex(String.class, GroupedStatistics.class);
		alertPrimaryIdx = this.dbEnvironment.getTreeMenuStore().getPrimaryIndex(String.class, Alert.class);
	}
	
	public Alert getAlert(String alertName) {
		return alertPrimaryIdx.get(alertName);
	}

	public List<Alert> getAlerts() {
		List<Alert> retList = new ArrayList<Alert>();
		EntityCursor<Alert> pi_cursor = alertPrimaryIdx.entities();
		try {
		    for (Alert node : pi_cursor) {
		        retList.add(node);
		    }
		// Always make sure the cursor is closed when we are done with it.
		} finally {
			pi_cursor.close();
		} 
		return retList;
	}

	public GroupedStatistics getGroupedStatistics(String name) {
		return groupedStatPrimaryIdx.get(name);
	}

	public List<GroupedStatistics> getGroupedStatistics() {
		List<GroupedStatistics> retList = new ArrayList<GroupedStatistics>();
		EntityCursor<GroupedStatistics> pi_cursor = groupedStatPrimaryIdx.entities();
		try {
		    for (GroupedStatistics node : pi_cursor) {
		        retList.add(node);
		    }
		// Always make sure the cursor is closed when we are done with it.
		} finally {
			pi_cursor.close();
		} 
		return retList;
	}

	public List<LiveStatistics> getLiveStatistics(String guiPath,
			Long minTimeperiod, Long maxTimeperiod) {
		List<LiveStatistics> retList = new ArrayList<LiveStatistics>();

		LiveStatisticsPk fromKey = new LiveStatisticsPk();
		fromKey.setGuiPath(guiPath);
		fromKey.setTimeperiod(minTimeperiod);

		LiveStatisticsPk toKey = new LiveStatisticsPk();
		toKey.setGuiPath(guiPath);
		toKey.setTimeperiod(maxTimeperiod);

		EntityCursor<LiveStatistics> pi_cursor = liveStatPrimaryIdx.entities(
				fromKey, true, toKey, false);
		try {
			for (LiveStatistics node : pi_cursor) {
				retList.add(node);
			}
			// Always make sure the cursor is closed when we are done with it.
		} finally {
			pi_cursor.close();
		}
		return retList;
	}

	public List<TreeMenuNode> getTreeMenu() {
		List<TreeMenuNode> retList = new ArrayList<TreeMenuNode>();
		EntityCursor<TreeMenuNode> pi_cursor = treeMenuPrimaryIdx.entities();
		try {
		    for (TreeMenuNode node : pi_cursor) {
		        retList.add(node);
		    }
		// Always make sure the cursor is closed when we are done with it.
		} finally {
			pi_cursor.close();
		} 
		return retList;
	}

	public TreeMenuNode getTreeMenu(String guiPath) {
		return treeMenuPrimaryIdx.get(guiPath);
	}

	public void persistAlert(Alert alert) {
		alertPrimaryIdx.put(alert);
	}

	public void persistGroupInstrumentation(GroupedStatistics groupedStatistics) {
		groupedStatPrimaryIdx.put(groupedStatistics);
		
	}
	
	private TreeMenuNode updateTreeMenu(String guiPath, boolean hasValueInformation) {
		TreeMenuNode treeMenu = treeMenuPrimaryIdx.get(guiPath);
		if (treeMenu == null) {
			//Create new TreeMenu at guiPath
			treeMenu = new TreeMenuNode(guiPath, "Y");
		} else {
			//Update treeMenu at guiPath
			treeMenu.setNodeLive("Y");
		}
		
		if (treeMenu.getGuiPath() == null) {
			treeMenu.setGuiPath(guiPath);
		}

		if (hasValueInformation) {
			treeMenu.setHasValueInformation(hasValueInformation);
		}
		
		treeMenuPrimaryIdx.put(treeMenu);
		
		return treeMenu;
	}

	private Double parseDouble(String strVal) {
		Double retVal = null;
		if (strVal != null) {
			try {
				retVal = Double.parseDouble(strVal);
			} catch (NumberFormatException nfe) {
				retVal = null;
			}
		}
		
		return retVal;
	}
	
	private Long parseLong(String strVal) {
		Long retVal = null;
		if (strVal != null) {
			try {
				retVal = Long.parseLong(strVal);
			} catch (NumberFormatException nfe) {
				retVal = null;
			}
		}
		
		return retVal;
	}
	
	public void storeIncomingStatistics(String guiPath, Long timeperiod,
			String value, String valueType) {
		
		TreeMenuNode treeMenu = updateTreeMenu( guiPath, value != null);
		Long valueLong = parseLong(value);
		
		LiveStatisticsPk searchStat = new LiveStatisticsPk();
		searchStat.setGuiPath(guiPath);
		searchStat.setTimeperiod(timeperiod);
		
		LiveStatistics oldStat = liveStatPrimaryIdx.get(searchStat);
		storeLiveStatistics(oldStat, valueLong, valueType, guiPath, timeperiod);
	}
	
	private void storeLiveStatistics(LiveStatistics oldStat,
			Long valueLong, String valueType, String guiPath, Long timeperiod) {

        Long calculatedValue = calculateValueBasedOnValueType(valueLong, valueType);

		if (oldStat != null) {
			//We have a hit for a guipath and timeperiod. Update record
			//If there is a callsPerInterval, calculate new avg Execution time
			//Always set new value
			oldStat.setValue(calculatedValue);
			liveStatPrimaryIdx.put(oldStat);
		} else {
			//No hit, create new LiveStatistics
			LiveStatistics livestats = new LiveStatistics();
			LiveStatisticsPk pk = new LiveStatisticsPk();
			pk.setGuiPath(guiPath);
			pk.setTimeperiod(timeperiod);
			livestats.setPk(pk);
			
			livestats.setValue(calculatedValue);
			liveStatPrimaryIdx.put(livestats);
		}
	}

    private Long calculateValueBasedOnValueType(Long valueLong, String valueType) {
        Long valueReturn = null;

        if (valueType.equalsIgnoreCase("ns")) {
            //From nanoseconds to milliseconds
            valueReturn = valueLong / 1000000;
        } else if (valueType.equalsIgnoreCase("ms") || valueType.equalsIgnoreCase("n")) {
            valueReturn = valueLong;
        } else if (valueType.equalsIgnoreCase("s")) {
            //From seconds to milliseconds
            valueReturn = valueLong * 1000;
        } else if (valueType.equalsIgnoreCase("m")) {
            //From minutes to milliseconds
            valueReturn = valueLong * 60000;
        }

        return valueReturn;
    }

}
