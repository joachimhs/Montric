package org.eurekaj.simpledb.dao;

import com.amazonaws.services.simpledb.AmazonSimpleDB;
import com.amazonaws.services.simpledb.model.*;
import org.eurekaj.api.dao.GroupedStatisticsDao;
import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.datatypes.GroupedStatistics;
import org.eurekaj.simpledb.datatypes.SimpleDBAlert;
import org.eurekaj.simpledb.datatypes.SimpleDBGroupedStatistics;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 5/7/11
 * Time: 11:59 AM
 * To change this template use File | Settings | File Templates.
 */
public class SimpleDBGroupedStatisticsDao implements GroupedStatisticsDao{
    private AmazonSimpleDB amazonSimpleDB;

    public SimpleDBGroupedStatisticsDao(AmazonSimpleDB amazonSimpleDB) {
        this.amazonSimpleDB = amazonSimpleDB;
    }

    @Override
    public void persistGroupInstrumentation(GroupedStatistics groupedStatistics) {
        SimpleDBGroupedStatistics simpleDBGroupedStatistics = new SimpleDBGroupedStatistics(groupedStatistics);
        amazonSimpleDB.putAttributes(new PutAttributesRequest("EurekaJ_GroupedStatistics", groupedStatistics.getName(), simpleDBGroupedStatistics.getAmazonSimpleDBAttribute()));
    }

    @Override
    public GroupedStatistics getGroupedStatistics(String name) {
        GetAttributesResult result = amazonSimpleDB.getAttributes(new GetAttributesRequest("EurekaJ_GroupedStatistics", name));
        SimpleDBGroupedStatistics SimpleDBGroupedStatistics = new SimpleDBGroupedStatistics(result.getAttributes());

        return SimpleDBGroupedStatistics;
    }

    @Override
    public List<GroupedStatistics> getGroupedStatistics() {
        List<GroupedStatistics> groupedStatisticsList = new ArrayList<GroupedStatistics>();

        String sdbQuery = "select * from EurekaJ_GroupedStatistics";

        SelectRequest selectRequest = new SelectRequest(sdbQuery);
        for (Item item : amazonSimpleDB.select(selectRequest).getItems()) {
            groupedStatisticsList.add(new SimpleDBGroupedStatistics(item.getAttributes()));
        }

        return groupedStatisticsList;
    }
}
