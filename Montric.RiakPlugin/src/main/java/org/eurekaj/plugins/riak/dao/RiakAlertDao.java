package org.eurekaj.plugins.riak.dao;

import com.basho.riak.client.IRiakClient;
import com.basho.riak.client.RiakException;
import com.basho.riak.client.RiakRetryFailedException;
import com.basho.riak.client.bucket.Bucket;
import com.basho.riak.client.query.MapReduceResult;
import com.basho.riak.client.query.filter.*;
import com.basho.riak.client.query.functions.NamedJSFunction;
import com.basho.riak.client.query.indexes.BucketIndex;
import org.apache.log4j.Logger;
import org.eurekaj.api.dao.AlertDao;
import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.datatypes.TriggeredAlert;
import org.eurekaj.api.datatypes.basic.BasicAlert;
import org.eurekaj.api.datatypes.basic.BasicTriggeredAlert;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: joahaa
 * Date: 3/5/13
 * Time: 12:01 PM
 * To change this template use File | Settings | File Templates.
 */
public class RiakAlertDao implements AlertDao {
    private Logger logger = Logger.getLogger(RiakAlertDao.class.getName());

    private IRiakClient riakClient;

    public RiakAlertDao(IRiakClient riakClient) {
        this.riakClient = riakClient;
    }

    @Override
    public void persistAlert(Alert alert) {
        Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("Alert;" + alert.getAccountName()).execute();
            myBucket.store(alert.getAlertName(), alert).execute();
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        }
    }

    @Override
    public Alert getAlert(String alertName, String accountName) {
        BasicAlert alert = null;

        Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("Alert;" + accountName).execute();
            alert = myBucket.fetch(alertName, BasicAlert.class).execute();
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        }

        return alert;
    }

    @Override
    public List<Alert> getAlerts(String accountName) {
        List<Alert> alertList = new ArrayList<Alert>();

        Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("Alert;" + accountName).execute();

            for (String key : myBucket.fetchIndex(BucketIndex.index).withValue("$key").execute()) {
                alertList.add(myBucket.fetch(key, BasicAlert.class).execute());
            }
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        } catch (RiakException e) {
            e.printStackTrace();
        }

        return alertList;
    }

    @Override
    public void deleteAlert(String alertName, String accountName) {
        Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("Alert;" + accountName).execute();
            myBucket.delete(alertName).execute();
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        } catch (RiakException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    }

    @Override
    public void persistTriggeredAlert(TriggeredAlert triggeredAlert) {
        Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("Triggered_Alert;" + triggeredAlert.getAccountName()).execute();
            myBucket.store(triggeredAlert.getAlertName() + ";" + triggeredAlert.getTimeperiod(), triggeredAlert).execute();
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        }
    }

    @Override
    public List<TriggeredAlert> getTriggeredAlerts(String accountName, Long fromTimeperiod, Long toTimeperiod) {
        List<TriggeredAlert> triggeredAlertList = new ArrayList<TriggeredAlert>();
        try {
            MapReduceResult result = riakClient.mapReduce("Triggered_Alert;" + accountName)
                    .addKeyFilter(new TokenizeFilter(";",2))
                    .addKeyFilter(new StringToIntFilter())
                    .addKeyFilter(new BetweenFilter(fromTimeperiod, toTimeperiod))
                    .addMapPhase(new NamedJSFunction("Riak.mapValuesJson"), true)
                    .execute();

            logger.info("Key Filter: " + result.getResultRaw().toString());

            Collection<BasicTriggeredAlert> rtaList = result.getResult(BasicTriggeredAlert.class);
            triggeredAlertList.addAll(rtaList);

        } catch (RiakException e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        }

        return triggeredAlertList;
    }

    @Override
    public List<TriggeredAlert> getTriggeredAlerts(String alertname, String accountName, Long fromTimeperiod, Long toTimeperiod) {
        List<TriggeredAlert> triggeredAlertList = new ArrayList<TriggeredAlert>();
        try {
            MapReduceResult result = riakClient.mapReduce("Triggered_Alert;" + accountName)
                    .addKeyFilter(new TokenizeFilter(";",2))
                    .addKeyFilter(new StringToIntFilter())
                    .addKeyFilter(new BetweenFilter(fromTimeperiod, toTimeperiod))
                    .addMapPhase(new NamedJSFunction("Riak.mapValuesJson"), true)
                    .execute();

            logger.info("Key Filter: " + result.getResultRaw().toString());

            Collection<BasicTriggeredAlert> rtaList = result.getResult(BasicTriggeredAlert.class);

            //TODO: Fix Key Filter so this is not neccessary!
            for (BasicTriggeredAlert rta : rtaList) {
                if (rta.getAlertName().equals(alertname)) {
                    triggeredAlertList.add(rta);
                }
            }

        } catch (RiakException e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        }

        return triggeredAlertList;
    }

    @Override
    public List<TriggeredAlert> getRecentTriggeredAlerts(String accountName, int numAlerts) {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }
}
