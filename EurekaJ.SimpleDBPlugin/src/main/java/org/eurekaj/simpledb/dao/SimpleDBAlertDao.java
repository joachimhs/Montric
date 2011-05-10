package org.eurekaj.simpledb.dao;

import com.amazonaws.services.simpledb.AmazonSimpleDB;
import com.amazonaws.services.simpledb.model.*;
import org.eurekaj.api.dao.AlertDao;
import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.datatypes.TriggeredAlert;
import org.eurekaj.api.enumtypes.AlertStatus;
import org.eurekaj.api.enumtypes.AlertType;
import org.eurekaj.simpledb.SimpleDBUtil;
import org.eurekaj.simpledb.datatypes.SimpleDBAlert;
import org.eurekaj.simpledb.datatypes.SimpleDBTriggeredAlert;
import org.omg.PortableInterceptor.SYSTEM_EXCEPTION;

import java.util.ArrayList;
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
        SimpleDBAlert simpleDBAlert = new SimpleDBAlert(alert);
        amazonSimpleDB.putAttributes(new PutAttributesRequest("EurekaJ_Alert", alert.getAlertName(), simpleDBAlert.getAmazonSimpleDBAttribute()));
    }

    @Override
    public Alert getAlert(String alertName) {
        GetAttributesResult result = amazonSimpleDB.getAttributes(new GetAttributesRequest("EurekaJ_Alert", alertName));
        SimpleDBAlert sdbAlert = new SimpleDBAlert(result.getAttributes());

        return sdbAlert;
    }

    @Override
    public List<Alert> getAlerts() {
        List<Alert> alertList = new ArrayList<Alert>();

        String sdbQuery = "select * from EurekaJ_Alert";

        SelectRequest selectRequest = new SelectRequest(sdbQuery);
        for (Item item : amazonSimpleDB.select(selectRequest).getItems()) {
            alertList.add(new SimpleDBAlert(item.getAttributes()));
        }

        return alertList;
    }

    @Override
    public void persistTriggeredAlert(TriggeredAlert triggeredAlert) {
        SimpleDBTriggeredAlert simpleDBTriggeredAlert = new SimpleDBTriggeredAlert(triggeredAlert);

        amazonSimpleDB.putAttributes(new PutAttributesRequest("EurekaJ_TriggeredAlert", triggeredAlert.getAlertName() + "_" + triggeredAlert.getTimeperiod(), simpleDBTriggeredAlert.getAmazonSimpleDBAttribute()));
    }

    @Override
    public List<TriggeredAlert> getTriggeredAlerts(Long fromTimeperiod, Long toTimeperiod) {
        List<TriggeredAlert> triggeredAlertList = new ArrayList<TriggeredAlert>();

        String sdbQuery = "select * from EurekaJ_TriggeredAlert where " +
                " triggeredTimeperiod between \"" + SimpleDBUtil.getSimpleDBTimestamp(fromTimeperiod) +
                " \" and \"" + SimpleDBUtil.getSimpleDBTimestamp(toTimeperiod) + "\" " +
                " order  by triggeredTimeperiod desc";

        SelectRequest selectRequest = new SelectRequest(sdbQuery);
        for (Item item : amazonSimpleDB.select(selectRequest).getItems()) {
            triggeredAlertList.add(new SimpleDBTriggeredAlert(item.getAttributes()));
        }

        return triggeredAlertList;
    }

    @Override
    public List<TriggeredAlert> getTriggeredAlerts(String alertname, Long fromTimeperiod, Long toTimeperiod) {
        List<TriggeredAlert> triggeredAlertList = new ArrayList<TriggeredAlert>();

        String sdbQuery = "select * from EurekaJ_TriggeredAlert where alertName = \"" + alertname + "\" + " +
                " triggeredTimeperiod between \"" + SimpleDBUtil.getSimpleDBTimestamp(fromTimeperiod) +
                " \" and \"" + SimpleDBUtil.getSimpleDBTimestamp(toTimeperiod) + "\" " +
                " order  by triggeredTimeperiod desc";

        SelectRequest selectRequest = new SelectRequest(sdbQuery);
        for (Item item : amazonSimpleDB.select(selectRequest).getItems()) {
            triggeredAlertList.add(new SimpleDBTriggeredAlert(item.getAttributes()));
        }

        return triggeredAlertList;
    }

    @Override
    public List<TriggeredAlert> getRecentTriggeredAlerts(int numAlerts) {
        List<TriggeredAlert> triggeredAlertList = new ArrayList<TriggeredAlert>();

        String millis =  SimpleDBUtil.getSimpleDBTimestamp(System.currentTimeMillis() - (15000 * numAlerts));
        String sdbQuery = "select * from EurekaJ_TriggeredAlert where " +
                " triggeredTimeperiod >= \"" + millis + "\" " +
                " order  by triggeredTimeperiod desc";


        SelectRequest selectRequest = new SelectRequest(sdbQuery);
        for (Item item : amazonSimpleDB.select(selectRequest).getItems()) {
            triggeredAlertList.add(new SimpleDBTriggeredAlert(item.getAttributes()));
        }

        return triggeredAlertList;
    }
}
