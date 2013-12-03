package org.eurekaj.plugins.riak.dao;

import com.basho.riak.client.IRiakClient;
import com.basho.riak.client.RiakException;
import com.basho.riak.client.RiakRetryFailedException;
import com.basho.riak.client.bucket.Bucket;
import com.google.common.cache.Cache;
import org.apache.log4j.Logger;
import org.eurekaj.api.dao.LiveStatisticsDao;
import org.eurekaj.api.datatypes.LiveStatistics;
import org.eurekaj.api.datatypes.LiveStatisticsUtil;
import org.eurekaj.api.datatypes.basic.BasicLiveStatistics;
import org.eurekaj.api.datatypes.basic.BasicMetricHour;
import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.api.enumtypes.ValueType;

import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Created with IntelliJ IDEA.
 * User: joahaa
 * Date: 3/3/13
 * Time: 1:43 AM
 * To change this template use File | Settings | File Templates.
 */
public class RiakLiveStatisticsDao implements LiveStatisticsDao {
    private static Logger logger = Logger.getLogger(RiakLiveStatisticsDao.class.getName());

    private IRiakClient riakClient;
    private Cache<String, BasicMetricHour> metricHourCache;
    private Hashtable<String, BasicMetricHour> metricHoursToStoreHash;
    private long metricHoursLastPersited = 0;
    private ExecutorService storageThreadPool = Executors.newFixedThreadPool(8);

    public RiakLiveStatisticsDao(IRiakClient riakClient, Cache<String, BasicMetricHour> metricHourCache) {
        this.riakClient = riakClient;
        this.metricHourCache = metricHourCache;
        this.metricHoursToStoreHash  = new Hashtable<String, BasicMetricHour>();
    }

    @Override
    public void storeIncomingStatistics(String guiPath, String accountName, Long timeperiod, String value, ValueType valueType, UnitType unitType, Long count) {
        Double valueDouble = LiveStatisticsUtil.parseDouble(value);
        long hoursSince1970 = timeperiod / 240;

        Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket(accountName + ";" + hoursSince1970).execute();
            BasicMetricHour storedMetricHour = myBucket.fetch("" + guiPath, BasicMetricHour.class).execute();
            if (storedMetricHour == null) {
                storedMetricHour = new BasicMetricHour(guiPath, accountName, hoursSince1970, valueType.toString(), unitType.toString());
            }

            storedMetricHour.addStatistic(new BasicLiveStatistics(guiPath, accountName, timeperiod, valueDouble, valueType.value(), unitType.value(), count));

            myBucket.store("" + guiPath, storedMetricHour).execute();
        } catch (RiakRetryFailedException e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        }
    }

    private BasicMetricHour getMetricHour(String accountName, String guiPath, long hoursSince1970) {
        //logger.info("getting Metric Hour for account: " + accountName + " guiPath: " + guiPath + " ts: " + hoursSince1970);
        BasicMetricHour metricHour = null;

        Bucket mhBucket = null;
        try {
            mhBucket = riakClient.fetchBucket(accountName + ";" + hoursSince1970).execute();
            metricHour = mhBucket.fetch("" + guiPath, BasicMetricHour.class).execute();
            logger.info("finding: " + accountName + ";" + hoursSince1970 + "/" + guiPath);
            if (metricHour != null) {
                metricHourCache.put(
                        metricHour.getAccountName() + ";" + metricHour.getGuiPath() + ";" + metricHour.getHoursSince1970(),
                        metricHour
                );
            }
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        }

        return metricHour;
    }

    private void persistRecentMetricHours() {
        if ((System.currentTimeMillis() - metricHoursLastPersited) > 5000) {
            //Persist metric hours received in the last 10 seconds

            List<BasicMetricHour> listOne = new ArrayList<BasicMetricHour>();
            listOne.addAll(metricHoursToStoreHash.values());

            storageThreadPool.submit(new StoreMetricHourListThread(listOne, riakClient));
            //storageThreadPool.submit(new StoreMetricHourListThread(listTwo, riakClient));
            //storageThreadPool.submit(new StoreMetricHourListThread(listThree, riakClient));
            //storageThreadPool.submit(new StoreMetricHourListThread(listFour, riakClient));

            logger.info("Persisting metric hours received in the last 5 seconds in 4 threads: " + metricHoursToStoreHash.size());

            metricHoursToStoreHash.clear();
            metricHoursLastPersited = System.currentTimeMillis();
        }
    }

    @Override
    public void storeIncomingStatistics(List<LiveStatistics> liveStatisticsList) {
        for (LiveStatistics ls : liveStatisticsList) {
            long hoursSince1970 = ls.getTimeperiod() / 240;
            
            BasicMetricHour mhToStore = metricHoursToStoreHash.get(ls.getAccountName() + ";" + ls.getGuiPath() + ";" + hoursSince1970);
            boolean wasInStoreHash = mhToStore != null;

            if (mhToStore == null) {
                //Not in store-hash chech in metricHourCache
                mhToStore = metricHourCache.getIfPresent(ls.getAccountName() + ";" + ls.getGuiPath() + ";" + hoursSince1970);
            }

            if (mhToStore == null) {
                //Not in metricHourCache, fetch from Riak
                mhToStore = getMetricHour(ls.getAccountName(), ls.getGuiPath(), hoursSince1970);
            }

            if (mhToStore == null) {
                //Not in Riak, create
                mhToStore = new BasicMetricHour(ls.getGuiPath(), ls.getAccountName(), hoursSince1970, ls.getValueType(), ls.getUnitType());
            }

            mhToStore.addStatistic(ls);
            
            if (!wasInStoreHash) {
                metricHoursToStoreHash.put(ls.getAccountName() + ";" + ls.getGuiPath() + ";" + hoursSince1970, mhToStore);
            }
        }

        persistRecentMetricHours();
    }

    @Override
    public List<LiveStatistics> getLiveStatistics(String guiPath, String accountName, Long minTimeperiod, Long maxTimeperiod) {
        Long fromHoursSince1970 = minTimeperiod / 240;
        Long toHoursSince1970 = maxTimeperiod / 240;

        List<LiveStatistics> retList = new ArrayList<LiveStatistics>();

        for (Long index = fromHoursSince1970; index <= toHoursSince1970; index++) {
            BasicMetricHour metricHour = getMetricHour(accountName, guiPath, index);
            if (metricHour == null) {
                metricHour = new BasicMetricHour(guiPath, accountName, index, ValueType.VALUE.value(), UnitType.N.value());
            }

            //If this is the first hour, start from the correct 15-second timeslot within the hour
            Integer minTimeperiodWithinTheHour = 0;
            if (index.longValue() == fromHoursSince1970.longValue()) {
                minTimeperiodWithinTheHour = LiveStatisticsUtil.getFifteensecondTimeperiodsSinceStartOfHour(minTimeperiod * 15);
            }

            //If this is the last hour, end with the correct 15-second timeslot within the hour
            Integer maxTimeperiodWithinTheHour = null;
            if (index.longValue() == toHoursSince1970.longValue()) {
                maxTimeperiodWithinTheHour = LiveStatisticsUtil.getFifteensecondTimeperiodsSinceStartOfHour(maxTimeperiod * 15);
            }

            retList.addAll(createLivestatisticsFromMetricHour(metricHour, minTimeperiodWithinTheHour, maxTimeperiodWithinTheHour, index));
        }

        return retList;
    }

    private List<LiveStatistics> createLivestatisticsFromMetricHour(BasicMetricHour metricHour, Integer minTimeperiodWithinTheHour, Integer maxTimeperiodWithinTheHour, Long hoursSince1970) {
        List<LiveStatistics> retList = new ArrayList<LiveStatistics>();

        if (maxTimeperiodWithinTheHour == null) {
            maxTimeperiodWithinTheHour = 239;
        }

        for (int index = minTimeperiodWithinTheHour; index <= maxTimeperiodWithinTheHour; index++) {
            Long timeperiod = (hoursSince1970 * 240) + index;

            //logger.info("Creating LiveStats for: " + metricHour.getId() + " with value: " + metricHour.getValueAt(index));
            retList.add(new BasicLiveStatistics(metricHour.getGuiPath(), metricHour.getAccountName(), timeperiod, metricHour.getMetrics()[index], metricHour.getValueType(), metricHour.getUnitType(), metricHour.getMeasurementCount()[index]));
        }

        return retList;
    }

    @Override
    public void deleteLiveStatisticsOlderThan(Date date, String accountName) {
        Long fromHoursSince1970 = date.getTime() / (15000 * 240);
        Long toHoursSince1970 = new Date().getTime() / (15000 * 240);
        logger.info("hoursSince1970: " + fromHoursSince1970);
        logger.info("toSince1970: " + toHoursSince1970);

        try {

            for (int index = fromHoursSince1970.intValue(); index <= toHoursSince1970.intValue(); index++) {
                int keys = 0;
                Bucket hourBucket = riakClient.fetchBucket(accountName + ";" + index).execute();
                try {
                    for (String key : hourBucket.keys()) {
                        hourBucket.delete(key);
                        keys++;
                    }
                } catch (RiakException e) {
                    e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
                }

                logger.info("deleted all keys(" + keys + ") in bucket: " + accountName + ";" + index);
            }

        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        }


        //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public void deleteLiveStatisticsBetween(String guiPath, String accountName, Long fromTimeperiod, Long toTimeperiod) {
        //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public void markLiveStatisticsAsCalculated(String guiPath, String accountName, String timeperiod) {
        //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public void markLiveStatisticsAsCalculated(String guiPath, String accountName, Long minTimeperiod, Long maxTimeperiod) {
        //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public void deleteMarkedLiveStatistics() {
        //To change body of implemented methods use File | Settings | File Templates.
    }
}
