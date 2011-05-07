package org.eurekaj.simpledb.dao;

import com.amazonaws.services.simpledb.AmazonSimpleDB;
import org.eurekaj.api.dao.AlertDao;
import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.datatypes.TriggeredAlert;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 5/7/11
 * Time: 11:58 AM
 * To change this template use File | Settings | File Templates.
 */
public class SimpleDBAlertDao implements AlertDao{
    private AmazonSimpleDB amazonSimpleDB;

    public SimpleDBAlertDao(AmazonSimpleDB amazonSimpleDB) {
        this.amazonSimpleDB = amazonSimpleDB;
    }

    @Override
    public void persistAlert(Alert alert) {
        //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public Alert getAlert(String alertName) {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public List<Alert> getAlerts() {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public void persistTriggeredAlert(TriggeredAlert triggeredAlert) {
        //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public List<TriggeredAlert> getTriggeredAlerts(Long fromTimeperiod, Long toTimeperiod) {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public List<TriggeredAlert> getTriggeredAlerts(String alertname, Long fromTimeperiod, Long toTimeperiod) {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public List<TriggeredAlert> getRecentTriggeredAlerts(int numAlerts) {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }
}
