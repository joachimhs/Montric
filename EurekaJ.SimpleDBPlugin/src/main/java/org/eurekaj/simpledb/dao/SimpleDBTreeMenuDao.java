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
package org.eurekaj.simpledb.dao;

import com.amazonaws.services.simpledb.AmazonSimpleDB;
import com.amazonaws.services.simpledb.model.*;

import org.apache.log4j.Logger;
import org.eurekaj.api.dao.LiveStatisticsDao;
import org.eurekaj.api.dao.TreeMenuDao;
import org.eurekaj.api.datatypes.*;
import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.api.enumtypes.ValueType;
import org.eurekaj.simpledb.SimpleDBUtil;
import org.eurekaj.simpledb.datatypes.SimpleDBLiveStatistics;
import org.eurekaj.simpledb.datatypes.SimpleDBTreeMenuNode;
import sun.reflect.generics.reflectiveObjects.NotImplementedException;

import java.util.*;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 5/7/11
 * Time: 11:57 AM
 * To change this template use File | Settings | File Templates.
 */
public class SimpleDBTreeMenuDao implements TreeMenuDao, LiveStatisticsDao {
	private static final Logger log = Logger.getLogger(SimpleDBTreeMenuDao.class);
    private AmazonSimpleDB amazonSimpleDB;
    private List<ReplaceableItem> liveStatisticsToSendList;
    private Long statsSentTimestamp = 0l;
    private Long treeMenuSentTimestamp = 0l;
    private List<ReplaceableItem> treeMenuToSendList;
    private Map<String, SimpleDBTreeMenuNode> treeMenuNodeHash;
    private Long treeMenuFetchedTimestamp = 0l;

    public SimpleDBTreeMenuDao(AmazonSimpleDB amazonSimpleDB) {
        this.amazonSimpleDB = amazonSimpleDB;
        this.liveStatisticsToSendList = new ArrayList<ReplaceableItem>();
        this.treeMenuToSendList = new ArrayList<ReplaceableItem>();
        treeMenuNodeHash = new HashMap<String, SimpleDBTreeMenuNode>();
    }

    /**
     * We are only sending statistics to SimpleDB every 5 seconds so that we dont have to trash the
     * SimpleDB database with multiple single puts
     *
     * @param liveStatisticsReplacableItem
     */
    private synchronized void addAndSendLiveStatistics(ReplaceableItem liveStatisticsReplacableItem) {
        Long before = System.currentTimeMillis();

        liveStatisticsToSendList.add(liveStatisticsReplacableItem);

        if (System.currentTimeMillis() - statsSentTimestamp > 5000) {
            log.debug("Sending contents to SimpleDB");
            amazonSimpleDB.batchPutAttributes(new BatchPutAttributesRequest("EurekaJ_LiveStatistics", liveStatisticsToSendList));
            log.debug("Finished sendinging contents to SimpleDB");
            liveStatisticsToSendList.clear();
            statsSentTimestamp = System.currentTimeMillis();
        }

        log.debug("Added/Sent LiveStats in: " + (System.currentTimeMillis() - before) + " ms..");
    }

    /**
     * We are only sending treeMenu to SimpleDB every 5 seconds so that we dont have to trash the
     * SimpleDB database with multiple single puts
     *
     * @param treeMenuReplacableItem
     */
    private synchronized void addAndSendTreeMenu(ReplaceableItem treeMenuReplacableItem) {
        Long before = System.currentTimeMillis();
        treeMenuToSendList.add(treeMenuReplacableItem);

        if (System.currentTimeMillis() - statsSentTimestamp > 5000) {
            log.debug("Sending treeMenu to SimpleDB");
            amazonSimpleDB.batchPutAttributes(new BatchPutAttributesRequest("EurekaJ_TreeMenuNode", treeMenuToSendList));
            log.debug("Finished treeMenu contents to SimpleDB");
            treeMenuToSendList.clear();
            treeMenuSentTimestamp = System.currentTimeMillis();
        }

        log.debug("Added/Sent TreeMenu in: " + (System.currentTimeMillis() - before) + " ms..");
    }

    private void fetchTreeMenuAndAddToHash() {
        treeMenuNodeHash.clear();

        String sdbQuery = "select * from EurekaJ_TreeMenuNode";

        SelectRequest selectRequest = new SelectRequest(sdbQuery);
        for (Item item : amazonSimpleDB.select(selectRequest).getItems()) {
            SimpleDBTreeMenuNode treeMenuNode = new SimpleDBTreeMenuNode(item.getAttributes());
            treeMenuNodeHash.put(treeMenuNode.getGuiPath(), treeMenuNode);
        }
    }

    @Override
    public List<TreeMenuNode> getTreeMenu() {

        //If more than 50 seconds since last TreeMenu Fetch
        if ((System.currentTimeMillis() - treeMenuFetchedTimestamp) > 50000) {
            fetchTreeMenuAndAddToHash();
        }

        List<TreeMenuNode> treeMenuNodeList = new ArrayList<TreeMenuNode>();
        treeMenuNodeList.addAll(treeMenuNodeHash.values());
        Collections.sort(treeMenuNodeList, new SimpleDBTreeMenuNode.TreeMenuNodeComparator());

        return treeMenuNodeList;

    }

    @Override
    public TreeMenuNode getTreeMenu(String guiPath) {
        SimpleDBTreeMenuNode simpleDBTreeMenuNode = treeMenuNodeHash.get(guiPath);

        if (simpleDBTreeMenuNode == null) {
            fetchTreeMenuAndAddToHash();
            simpleDBTreeMenuNode = treeMenuNodeHash.get(guiPath);
        }

        return simpleDBTreeMenuNode;
    }

    private SimpleDBLiveStatistics getLiveStatistics(String guiPath, Long timeperiod) {
        Long before = System.currentTimeMillis();

        GetAttributesResult result = amazonSimpleDB.getAttributes(new GetAttributesRequest("EurekaJ_LiveStatistics",
                guiPath + "_" + timeperiod));


        SimpleDBLiveStatistics simpleDBLiveStatistics = new SimpleDBLiveStatistics(result.getAttributes());

        log.debug("Got Livestats in: " + (System.currentTimeMillis() - before) + " ms..");
        return simpleDBLiveStatistics;
    }

    @Override
    public void storeIncomingStatistics(String guiPath, Long timeperiod, String value, ValueType valueType, UnitType unitType) {
        Long before = System.currentTimeMillis();

        updateTreeMenu(guiPath);
        log.debug("Updated TreeMenu. Took: " + (System.currentTimeMillis() - before) + " ms");

        SimpleDBLiveStatistics simpleDBLiveStatistics = new SimpleDBLiveStatistics();
        simpleDBLiveStatistics.setGuiPath(guiPath);
        simpleDBLiveStatistics.setTimeperiod(timeperiod);
        simpleDBLiveStatistics.setValue(value);

        Double calculatedValue = LiveStatisticsUtil.calculateValueBasedOnUnitType(simpleDBLiveStatistics.getValue(), unitType);

        log.debug("Calculated value. Took: " + (System.currentTimeMillis() - before) + " ms");

        SimpleDBLiveStatistics livestat = getLiveStatistics(guiPath, timeperiod);
        if (livestat == null) {
            livestat = new SimpleDBLiveStatistics();
        }

        log.debug("Got Old LiveStats. Took: " + (System.currentTimeMillis() - before) + " ms");

        livestat.setGuiPath(guiPath);
        livestat.setTimeperiod(timeperiod);
        livestat.setValue(calculatedValue);

        ReplaceableItem ri = new ReplaceableItem(
                simpleDBLiveStatistics.getGuiPath() + "_" + simpleDBLiveStatistics.getTimeperiod(),
                simpleDBLiveStatistics.getAmazonSimpleDBAttribute());

        log.debug("Created ReplacableItem. Took: " + (System.currentTimeMillis() - before) + " ms");

        this.addAndSendLiveStatistics(ri);

        log.debug("Finished storing LiveStatistics. Took: " + (System.currentTimeMillis() - before) + " ms");
    }

    private SimpleDBTreeMenuNode updateTreeMenu(String guiPath) {
        TreeMenuNode treeMenu = getTreeMenu(guiPath);
        if (treeMenu == null) {
            //Create new TreeMenu at guiPath
            treeMenu = new SimpleDBTreeMenuNode(guiPath, "Y");
            treeMenuNodeHash.put(guiPath, (SimpleDBTreeMenuNode) treeMenu);
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

    @Override
    public void deleteLiveStatisticsOlderThan(Date date) {
        throw new NotImplementedException();
    }
}
