package org.eurekaj.manager.dao.berkeley;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

import com.sleepycat.persist.SecondaryIndex;
import org.eurekaj.manager.berkeley.BerkeleyDbEnv;
import org.eurekaj.manager.berkeley.alert.TriggeredAlert;
import org.eurekaj.manager.berkeley.alert.TriggeredAlertPk;
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
    private PrimaryIndex<TriggeredAlertPk, TriggeredAlert> triggeredAlertPrimaryIdx;
    private SecondaryIndex<Long, TriggeredAlertPk, TriggeredAlert> triggeredAlertTimeperiodSecondaryIdx;

	
	public void setDbEnvironment(BerkeleyDbEnv dbEnvironment) {
		this.dbEnvironment = dbEnvironment;
		treeMenuPrimaryIdx = this.dbEnvironment.getTreeMenuStore().getPrimaryIndex(String.class, TreeMenuNode.class);
		liveStatPrimaryIdx = this.dbEnvironment.getLiveStatisticsStore().getPrimaryIndex(LiveStatisticsPk.class, LiveStatistics.class);
		groupedStatPrimaryIdx = this.dbEnvironment.getTreeMenuStore().getPrimaryIndex(String.class, GroupedStatistics.class);
		alertPrimaryIdx = this.dbEnvironment.getTreeMenuStore().getPrimaryIndex(String.class, Alert.class);
        triggeredAlertPrimaryIdx = this.dbEnvironment.getTriggeredAlertStore().getPrimaryIndex(TriggeredAlertPk.class, TriggeredAlert.class);
        triggeredAlertTimeperiodSecondaryIdx = this.dbEnvironment.getTriggeredAlertStore().getSecondaryIndex(triggeredAlertPrimaryIdx, Long.class, "triggeredTimeperiod");
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

    @Override
    public void persistTriggeredAlert(TriggeredAlert triggeredAlert) {
        triggeredAlertPrimaryIdx.put(triggeredAlert);
    }

    @Override
    public List<TriggeredAlert> getTriggeredAlerts(Long fromTimeperiod, Long toTimeperiod) {
        List<TriggeredAlert> retList = new ArrayList<TriggeredAlert>();

        EntityCursor<TriggeredAlert> si_cursor = triggeredAlertTimeperiodSecondaryIdx.entities(fromTimeperiod, true, toTimeperiod, true);

		try {
			for (TriggeredAlert triggeredAlert : si_cursor) {
				retList.add(triggeredAlert);
			}
			// Always make sure the cursor is closed when we are done with it.
		} finally {
			si_cursor.close();
		}
		return retList;
    }

    @Override
    public List<TriggeredAlert> getTriggeredAlerts(String alertname, Long fromTimeperiod, Long toTimeperiod) {
        List<TriggeredAlert> retList = new ArrayList<TriggeredAlert>();

        TriggeredAlertPk fromKey = new TriggeredAlertPk(alertname, fromTimeperiod);
        TriggeredAlertPk toKey = new TriggeredAlertPk(alertname, toTimeperiod);

        EntityCursor<TriggeredAlert> pi_cursor = triggeredAlertPrimaryIdx.entities(fromKey, true, toKey, true);

		try {
			for (TriggeredAlert triggeredAlert : pi_cursor) {
				retList.add(triggeredAlert);
			}
			// Always make sure the cursor is closed when we are done with it.
		} finally {
			pi_cursor.close();
		}
		return retList;
    }

    @Override
    public List<TriggeredAlert> getRecentTriggeredAlerts(int numAlerts) {
        List<TriggeredAlert> retList = new ArrayList<TriggeredAlert>();

        Calendar nowCal = Calendar.getInstance();
        Long fromTimeperiod = nowCal.getTimeInMillis() / 15000;
        nowCal.add(Calendar.HOUR, -1 * 24 * 7);
        Long toTimeperiod = nowCal.getTimeInMillis() / 15000;

        EntityCursor<TriggeredAlert> si_cursor = triggeredAlertTimeperiodSecondaryIdx.entities(fromTimeperiod, true, toTimeperiod, true);

		try {
            //Ensure that we do not attempt to fetch more alerts than there are in the DB
            if (numAlerts > si_cursor.count()) {
                numAlerts = si_cursor.count();
            }

            //If there are any triggered alerts to fetch
            if (numAlerts > 0) {
                //Add the very last triggered alert to the return list
                TriggeredAlert triggeredAlert = si_cursor.last();
                retList.add(triggeredAlert);
                //Add the remaining up to numAlerts - 1 triggered alerts to the return list
                for (int i = 0; i < (numAlerts-1); i++) {
                    triggeredAlert = si_cursor.prev();
                    retList.add(triggeredAlert);
                }
            }
			// Always make sure the cursor is closed when we are done with it.
		} finally {
			si_cursor.close();
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
		Double valueLong = parseDouble(value);
		
		LiveStatisticsPk searchStat = new LiveStatisticsPk();
		searchStat.setGuiPath(guiPath);
		searchStat.setTimeperiod(timeperiod);
		
		LiveStatistics oldStat = liveStatPrimaryIdx.get(searchStat);
		storeLiveStatistics(oldStat, valueLong, valueType, guiPath, timeperiod);
	}
	
	private void storeLiveStatistics(LiveStatistics oldStat,
			Double valueDouble, String valueType, String guiPath, Long timeperiod) {

        Double calculatedValue = calculateValueBasedOnValueType(valueDouble, valueType);

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

    private Double calculateValueBasedOnValueType(Double valueDouble, String valueType) {
        Double valueReturn = null;

        if (valueDouble != null && valueType.equalsIgnoreCase("ns")) {
            //From nanoseconds to milliseconds
            valueReturn = valueDouble / 1000000;
        } else if (valueType.equalsIgnoreCase("ms") || valueType.equalsIgnoreCase("n")) {
            valueReturn = valueDouble;
        } else if (valueDouble != null && valueType.equalsIgnoreCase("s")) {
            //From seconds to milliseconds
            valueReturn = valueDouble * 1000;
        } else if (valueDouble != null && valueType.equalsIgnoreCase("m")) {
            //From minutes to milliseconds
            valueReturn = valueDouble * 60000;
        }

        return valueReturn;
    }

}
