package org.eurekaj.berkeley.db.dao;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

import org.eurekaj.api.dao.LiveStatisticsDao;
import org.eurekaj.api.dao.TreeMenuDao;
import org.eurekaj.api.datatypes.*;
import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.api.enumtypes.ValueType;
import org.eurekaj.berkeley.db.BerkeleyDbEnv;
import org.eurekaj.berkeley.db.datatypes.BerkeleyLiveStatistics;
import org.eurekaj.berkeley.db.datatypes.BerkeleyLiveStatisticsPk;
import org.eurekaj.berkeley.db.datatypes.BerkeleyTreeMenuNode;

import com.sleepycat.persist.EntityCursor;
import com.sleepycat.persist.PrimaryIndex;

public class BerkeleyTreeMenuDao implements TreeMenuDao, LiveStatisticsDao {
	private BerkeleyDbEnv dbEnvironment;
	private PrimaryIndex<String, BerkeleyTreeMenuNode> treeMenuPrimaryIdx;
	//statIndex = db.<BerkeleyLiveStatistics>createMultidimensionalIndex(BerkeleyLiveStatistics.class, new String[] {"guiPath", "timeperiod"}, true);
	private PrimaryIndex<BerkeleyLiveStatisticsPk, BerkeleyLiveStatistics> liveStatPrimaryIdx;


    public BerkeleyTreeMenuDao(BerkeleyDbEnv dbEnvironment) {
        this.dbEnvironment = dbEnvironment;
        treeMenuPrimaryIdx = this.dbEnvironment.getTreeMenuStore().getPrimaryIndex(String.class, BerkeleyTreeMenuNode.class);
		liveStatPrimaryIdx = this.dbEnvironment.getLiveStatisticsStore().getPrimaryIndex(BerkeleyLiveStatisticsPk.class, BerkeleyLiveStatistics.class);
    }

    @Override
	public List<LiveStatistics> getLiveStatistics(String guiPath,
			Long minTimeperiod, Long maxTimeperiod) {
		List<LiveStatistics> retList = new ArrayList<LiveStatistics>();

		BerkeleyLiveStatisticsPk fromKey = new BerkeleyLiveStatisticsPk();
		fromKey.setGuiPath(guiPath);
		fromKey.setTimeperiod(minTimeperiod);

		BerkeleyLiveStatisticsPk toKey = new BerkeleyLiveStatisticsPk();
		toKey.setGuiPath(guiPath);
		toKey.setTimeperiod(maxTimeperiod);

		EntityCursor<BerkeleyLiveStatistics> pi_cursor = liveStatPrimaryIdx.entities(
				fromKey, true, toKey, false);
		try {
			for (BerkeleyLiveStatistics node : pi_cursor) {
				retList.add(node);
			}
			// Always make sure the cursor is closed when we are done with it.
		} finally {
			pi_cursor.close();
		}
		return retList;
	}

    @Override
	public List<TreeMenuNode> getTreeMenu() {
		List<TreeMenuNode> retList = new ArrayList<TreeMenuNode>();
		EntityCursor<BerkeleyTreeMenuNode> pi_cursor = treeMenuPrimaryIdx.entities();
		try {
		    for (BerkeleyTreeMenuNode node : pi_cursor) {
		        retList.add(node);
		    }
		// Always make sure the cursor is closed when we are done with it.
		} finally {
			pi_cursor.close();
		} 
		return retList;
	}

    @Override
	public BerkeleyTreeMenuNode getTreeMenu(String guiPath) {
		return treeMenuPrimaryIdx.get(guiPath);
	}


	
	private BerkeleyTreeMenuNode updateTreeMenu(String guiPath, boolean hasValueInformation) {
		BerkeleyTreeMenuNode treeMenu = treeMenuPrimaryIdx.get(guiPath);
		if (treeMenu == null) {
			//Create new TreeMenu at guiPath
			treeMenu = new BerkeleyTreeMenuNode(guiPath, "Y");
		} else {
			//Update treeMenu at guiPath
			treeMenu.setNodeLive("Y");
		}
		
		if (treeMenu.getGuiPath() == null) {
			treeMenu.setGuiPath(guiPath);
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


    @Override
    public void storeIncomingStatistics(String guiPath, Long timeperiod, String value, ValueType valueType, UnitType unitType) {
		
		BerkeleyTreeMenuNode treeMenu = updateTreeMenu( guiPath, value != null);
		Double valueDouble = parseDouble(value);
		
		BerkeleyLiveStatisticsPk searchStat = new BerkeleyLiveStatisticsPk();
		searchStat.setGuiPath(guiPath);
		searchStat.setTimeperiod(timeperiod);
		
		BerkeleyLiveStatistics oldStat = liveStatPrimaryIdx.get(searchStat);
		storeLiveStatistics(oldStat, valueDouble, valueType, unitType, guiPath, timeperiod);
	}
	
	private void storeLiveStatistics(BerkeleyLiveStatistics oldStat,
			Double valueDouble, ValueType valueType, UnitType unitType, String guiPath, Long timeperiod) {

        Double calculatedValue = LiveStatisticsUtil.calculateValueBasedOnUnitType(valueDouble, unitType);

		if (oldStat != null) {
			//We have a hit for a guipath and timeperiod. Update record
			//Always set new value
			oldStat.setValue(LiveStatisticsUtil.calculateValueBasedOnValueType(oldStat, calculatedValue, valueType));
			liveStatPrimaryIdx.put(oldStat);
		} else {
			//No hit, create new BerkeleyLiveStatistics
			BerkeleyLiveStatistics livestats = new BerkeleyLiveStatistics();
			BerkeleyLiveStatisticsPk pk = new BerkeleyLiveStatisticsPk();
			pk.setGuiPath(guiPath);
			pk.setTimeperiod(timeperiod);
			livestats.setPk(pk);
			
			livestats.setValue(calculatedValue);
			liveStatPrimaryIdx.put(livestats);
		}
	}





}
