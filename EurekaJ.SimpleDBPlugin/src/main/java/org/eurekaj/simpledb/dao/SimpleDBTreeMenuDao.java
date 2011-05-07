package org.eurekaj.simpledb.dao;

import com.amazonaws.services.simpledb.AmazonSimpleDB;
import org.eurekaj.api.dao.LiveStatisticsDao;
import org.eurekaj.api.dao.TreeMenuDao;
import org.eurekaj.api.datatypes.LiveStatistics;
import org.eurekaj.api.datatypes.TreeMenuNode;
import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.api.enumtypes.ValueType;

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
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public TreeMenuNode getTreeMenu(String guiPath) {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public void storeIncomingStatistics(String guiPath, Long timeperiod, String value, ValueType valueType, UnitType unitType) {
        //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public List<LiveStatistics> getLiveStatistics(String guiPath, Long minTimeperiod, Long maxTimeperiod) {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }
}
