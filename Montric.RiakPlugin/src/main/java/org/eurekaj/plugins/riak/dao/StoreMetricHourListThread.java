package org.eurekaj.plugins.riak.dao;

import com.basho.riak.client.IRiakClient;
import com.basho.riak.client.RiakRetryFailedException;
import com.basho.riak.client.bucket.Bucket;
import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.basic.BasicMetricHour;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: joahaa
 * Date: 3/5/13
 * Time: 10:58 AM
 * To change this template use File | Settings | File Templates.
 */
public class StoreMetricHourListThread implements Runnable {
    private Logger logger = Logger.getLogger(StoreMetricHourListThread.class.getName());
    List<BasicMetricHour> metricHourList;
    private IRiakClient riakClient;

    public StoreMetricHourListThread(List<BasicMetricHour> metricHourList, IRiakClient riakClient) {
        this.metricHourList = metricHourList;
        this.riakClient = riakClient;
    }

    @Override
    public void run() {
        for (BasicMetricHour metricHour : metricHourList) {
            Bucket mhBucket = null;
            try {
                mhBucket = riakClient.fetchBucket(metricHour.getAccountName() + ";" + metricHour.getHoursSince1970()).execute();
                mhBucket.store("" + metricHour.getGuiPath(), metricHour).execute();
            } catch (RiakRetryFailedException rrfe) {
                rrfe.printStackTrace();
            }
        }

        logger.info("Stored " + metricHourList.size() + " metric hours in Thread: " + Thread.currentThread().getName());
    }
}
