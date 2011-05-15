package org.eurekaj.simpledb.dao;

import com.amazonaws.services.simpledb.AmazonSimpleDB;
import com.amazonaws.services.simpledb.model.*;
import org.eurekaj.api.dao.LiveStatisticsDao;
import org.eurekaj.api.dao.TreeMenuDao;
import org.eurekaj.api.datatypes.*;
import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.api.enumtypes.ValueType;
import org.eurekaj.simpledb.SimpleDBUtil;
import org.eurekaj.simpledb.datatypes.SimpleDBEmailRecipientGroup;
import org.eurekaj.simpledb.datatypes.SimpleDBLiveStatistics;
import org.eurekaj.simpledb.datatypes.SimpleDBTreeMenuNode;
import org.eurekaj.simpledb.datatypes.SimpleDBTriggeredAlert;

import java.nio.LongBuffer;
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
    private List<ReplaceableItem> liveStatisticsList;
    private Long statsSentTimestamp = 0l;
    private Long treeMenuSentTimestamp = 0l;
    private List<ReplaceableItem> treeMenuList;

    public SimpleDBTreeMenuDao(AmazonSimpleDB amazonSimpleDB) {
        this.amazonSimpleDB = amazonSimpleDB;
        this.liveStatisticsList = new ArrayList<ReplaceableItem>();
        this.treeMenuList = new ArrayList<ReplaceableItem>();
    }

    /**
     * We are only sending statistics to SimpleDB every 5 seconds so that we dont have to trash the
     * SimpleDB database with multiple single puts
     *
     * @param liveStatisticsReplacableItem
     */
    private synchronized void addAndSendLiveStatistics(ReplaceableItem liveStatisticsReplacableItem) {
        Long before = System.currentTimeMillis();

        liveStatisticsList.add(liveStatisticsReplacableItem);

        if (System.currentTimeMillis() - statsSentTimestamp > 5000) {
            System.out.println("Sending contents to SimpleDB");
            amazonSimpleDB.batchPutAttributes(new BatchPutAttributesRequest("EurekaJ_LiveStatistics", liveStatisticsList));
            System.out.println("Finished sendinging contents to SimpleDB");
            liveStatisticsList.clear();
            statsSentTimestamp = System.currentTimeMillis();
        }

        System.out.println("Added/Sent LiveStats in: " + (System.currentTimeMillis() - before) + " ms..");
    }

    /**
     * We are only sending treeMenu to SimpleDB every 5 seconds so that we dont have to trash the
     * SimpleDB database with multiple single puts
     *
     * @param treeMenuReplacableItem
     */
    private synchronized void addAndSendTreeMenu(ReplaceableItem treeMenuReplacableItem) {
        Long before = System.currentTimeMillis();
        treeMenuList.add(treeMenuReplacableItem);

        if (System.currentTimeMillis() - statsSentTimestamp > 5000) {
            System.out.println("Sending treeMenu to SimpleDB");
            amazonSimpleDB.batchPutAttributes(new BatchPutAttributesRequest("EurekaJ_TreeMenuNode", treeMenuList));
            System.out.println("Finished treeMenu contents to SimpleDB");
            treeMenuList.clear();
            treeMenuSentTimestamp = System.currentTimeMillis();
        }

        System.out.println("Added/Sent TreeMenu in: " + (System.currentTimeMillis() - before) + " ms..");
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
        Long before = System.currentTimeMillis();

        GetAttributesResult result = amazonSimpleDB.getAttributes(new GetAttributesRequest("EurekaJ_LiveStatistics",
                guiPath + "_" + timeperiod));


        SimpleDBLiveStatistics simpleDBLiveStatistics = new SimpleDBLiveStatistics(result.getAttributes());

        System.out.println("Got Livestats in: " + (System.currentTimeMillis() - before) + " ms..");
        return simpleDBLiveStatistics;
    }

    @Override
    public void storeIncomingStatistics(String guiPath, Long timeperiod, String value, ValueType valueType, UnitType unitType) {
        Long before = System.currentTimeMillis();

        updateTreeMenu(guiPath);
        System.out.println("Updated TreeMenu. Took: " + (System.currentTimeMillis() - before) + " ms");

        SimpleDBLiveStatistics simpleDBLiveStatistics = new SimpleDBLiveStatistics();
        simpleDBLiveStatistics.setGuiPath(guiPath);
        simpleDBLiveStatistics.setTimeperiod(timeperiod);
        simpleDBLiveStatistics.setValue(value);

        Double calculatedValue = LiveStatisticsUtil.calculateValueBasedOnUnitType(simpleDBLiveStatistics.getValue(), unitType);

        System.out.println("Calculated value. Took: " + (System.currentTimeMillis() - before) + " ms");

        SimpleDBLiveStatistics livestat = getLiveStatistics(guiPath, timeperiod);
        if (livestat == null) {
            livestat = new SimpleDBLiveStatistics();
        }

        System.out.println("Got Old LiveStats. Took: " + (System.currentTimeMillis() - before) + " ms");

        livestat.setGuiPath(guiPath);
        livestat.setTimeperiod(timeperiod);
        livestat.setValue(calculatedValue);

        ReplaceableItem ri = new ReplaceableItem(
                simpleDBLiveStatistics.getGuiPath() + "_" + simpleDBLiveStatistics.getTimeperiod(),
                simpleDBLiveStatistics.getAmazonSimpleDBAttribute());

        System.out.println("Created ReplacableItem. Took: " + (System.currentTimeMillis() - before) + " ms");

        this.addAndSendLiveStatistics(ri);

        System.out.println("Finished storing LiveStatistics. Took: " + (System.currentTimeMillis() - before) + " ms");
    }

    private SimpleDBTreeMenuNode updateTreeMenu(String guiPath) {
        TreeMenuNode treeMenu = getTreeMenu(guiPath);
        if (treeMenu == null) {
            //Create new TreeMenu at guiPath
            treeMenu = new SimpleDBTreeMenuNode(guiPath, "Y");
        }


        SimpleDBTreeMenuNode simpleDBTreeMenuNode = new SimpleDBTreeMenuNode(treeMenu);
        simpleDBTreeMenuNode.setNodeLive("Y");

        if (simpleDBTreeMenuNode.getGuiPath() == null) {
            simpleDBTreeMenuNode.setGuiPath(guiPath);
        }

        ReplaceableItem ri = new ReplaceableItem(
                simpleDBTreeMenuNode.getGuiPath(),
                simpleDBTreeMenuNode.getAmazonSimpleDBAttribute());

        this.addAndSendTreeMenu(ri);

        return simpleDBTreeMenuNode;
    }


    @Override
    public List<LiveStatistics> getLiveStatistics(String guiPath, Long minTimeperiod, Long maxTimeperiod) {
        List<LiveStatistics> liveStatisticsList = new ArrayList<LiveStatistics>();

        String sdbQuery = "select * from EurekaJ_LiveStatistics where " +
                " guiPath = \"" + guiPath + "\"  and timeperiod between \"" + SimpleDBUtil.getSimpleDBTimestamp(minTimeperiod) + "\" and \"" + SimpleDBUtil.getSimpleDBTimestamp(maxTimeperiod) + "\" " +
                " order  by timeperiod asc";

        SelectRequest selectRequest = new SelectRequest(sdbQuery);
        for (Item item : amazonSimpleDB.select(selectRequest).getItems()) {
            liveStatisticsList.add(new SimpleDBLiveStatistics(item.getAttributes()));
        }

        return liveStatisticsList;
    }
}
