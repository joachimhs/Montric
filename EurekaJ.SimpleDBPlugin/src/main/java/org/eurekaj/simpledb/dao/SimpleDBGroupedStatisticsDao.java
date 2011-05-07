package org.eurekaj.simpledb.dao;

import com.amazonaws.services.simpledb.AmazonSimpleDB;
import org.eurekaj.api.dao.GroupedStatisticsDao;
import org.eurekaj.api.datatypes.GroupedStatistics;

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
        //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public GroupedStatistics getGroupedStatistics(String name) {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public List<GroupedStatistics> getGroupedStatistics() {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }
}
