package org.eurekaj.simpledb.dao;

import com.amazonaws.services.simpledb.AmazonSimpleDB;
import com.amazonaws.services.simpledb.model.*;
import org.eurekaj.api.dao.LiveStatisticsDao;
import org.eurekaj.api.dao.TreeMenuDao;
import org.eurekaj.api.datatypes.*;
import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.api.enumtypes.ValueType;
import org.eurekaj.simpledb.datatypes.SimpleDBEmailRecipientGroup;
import org.eurekaj.simpledb.datatypes.SimpleDBLiveStatistics;
import org.eurekaj.simpledb.datatypes.SimpleDBTreeMenuNode;
import org.eurekaj.simpledb.datatypes.SimpleDBTriggeredAlert;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 5/7/11
 * Time: 11:57 AM
 * To change this template use File | Settings | File Templates.
 */
public class SimpleDBTreeMenuDao implements TreeMenuDao, LiveStatisticsDao {
    private AmazonSimpleDB amazonSimpleDB;

    public SimpleDBTreeMenuDao(AmazonSimpleDB amazonSimpleDB) {
        this.amazonSimpleDB = amazonSimpleDB;
    }

    @Override
    public List<TreeMenuNode> getTreeMenu() {
        List<TreeMenuNode> treeMenuNodeList = new ArrayList<TreeMenuNode>();

        String sdbQuery = "select * from EurekaJ_TreeMenuNode";

        SelectRequest selectRequest = new SelectRequest(sdbQuery);
        for (Item item : amazonSimpleDB.select(selectRequest).getItems()) {
            treeMenuNodeList.add(new SimpleDBTreeMenuNode(item.getAttributes()));
        }

        return treeMenuNodeList;

    }

    @Override
    public TreeMenuNode getTreeMenu(String guiPath) {
        GetAttributesResult result = amazonSimpleDB.getAttributes(new GetAttributesRequest("EurekaJ_TreeMenuNode", guiPath));
        SimpleDBTreeMenuNode simpleDBTreeMenuNode = new SimpleDBTreeMenuNode(result.getAttributes());

        return simpleDBTreeMenuNode;
    }

    private SimpleDBLiveStatistics getLiveStatistics(String guiPath, Long timeperiod) {
        GetAttributesResult result = amazonSimpleDB.getAttributes(new GetAttributesRequest("EurekaJ_LiveStatistics",
                guiPath + "_" + timeperiod));
        SimpleDBLiveStatistics simpleDBLiveStatistics = new SimpleDBLiveStatistics(result.getAttributes());

        return simpleDBLiveStatistics;
    }

    @Override
    public void storeIncomingStatistics(String guiPath, Long timeperiod, String value, ValueType valueType, UnitType unitType) {
        SimpleDBLiveStatistics simpleDBLiveStatistics = new SimpleDBLiveStatistics();
        simpleDBLiveStatistics.setGuiPath(guiPath);
        simpleDBLiveStatistics.setTimeperiod(timeperiod);
        simpleDBLiveStatistics.setValue(value);

        Double calculatedValue = LiveStatisticsUtil.calculateValueBasedOnUnitType(simpleDBLiveStatistics.getValue(), unitType);

        SimpleDBLiveStatistics oldStat = getLiveStatistics(guiPath, timeperiod);
		if (oldStat != null) {
			//We have a hit for a guipath and timeperiod. Update record
			//Always set new value
			oldStat.setValue(LiveStatisticsUtil.calculateValueBasedOnValueType(oldStat, calculatedValue, valueType));
			amazonSimpleDB.putAttributes(new PutAttributesRequest("EurekaJ_LiveStatistics",
                    simpleDBLiveStatistics.getGuiPath() + "_" + simpleDBLiveStatistics.getTimeperiod(),
                    simpleDBLiveStatistics.getAmazonSimpleDBAttribute()));
		} else {
			//No hit, create new BerkeleyLiveStatistics
			SimpleDBLiveStatistics livestats = new SimpleDBLiveStatistics();
			livestats.setGuiPath(guiPath);
			livestats.setTimeperiod(timeperiod);
			livestats.setValue(calculatedValue);

            amazonSimpleDB.putAttributes(new PutAttributesRequest("EurekaJ_LiveStatistics",
                    simpleDBLiveStatistics.getGuiPath() + "_" + simpleDBLiveStatistics.getTimeperiod(),
                    simpleDBLiveStatistics.getAmazonSimpleDBAttribute()));
		}
    }


    @Override
    public List<LiveStatistics> getLiveStatistics(String guiPath, Long minTimeperiod, Long maxTimeperiod) {
        List<LiveStatistics> liveStatisticsList = new ArrayList<LiveStatistics>();

        String sdbQuery = "select * from EurekaJ_LiveStatistics where " +
                " guiPath = \"" + guiPath + "\"  and timeperiod between \"" + minTimeperiod + "\" and \"" + maxTimeperiod + "\" " +
                " order  by timeperiod asc";

        SelectRequest selectRequest = new SelectRequest(sdbQuery);
        for (Item item : amazonSimpleDB.select(selectRequest).getItems()) {
            liveStatisticsList.add(new SimpleDBLiveStatistics(item.getAttributes()));
        }

        return liveStatisticsList;
    }
}
