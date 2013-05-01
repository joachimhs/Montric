package org.eurekaj.plugins.leveldb.dao;

import static org.iq80.leveldb.impl.Iq80DBFactory.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.Hashtable;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.log4j.Logger;
import org.eurekaj.api.dao.LiveStatisticsDao;
import org.eurekaj.api.datatypes.LiveStatistics;
import org.eurekaj.api.datatypes.LiveStatisticsUtil;
import org.eurekaj.api.datatypes.basic.BasicLiveStatistics;
import org.eurekaj.api.datatypes.basic.BasicMetricHour;
import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.api.enumtypes.ValueType;
import org.iq80.leveldb.DB;
import org.iq80.leveldb.DBIterator;
import org.iq80.leveldb.WriteBatch;

import com.google.common.cache.Cache;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class LevelDBLiveStatisticsDao implements LiveStatisticsDao {
	private static Logger logger = Logger.getLogger(LevelDBLiveStatisticsDao.class);
	
	private DB db;
	private Gson gson = new GsonBuilder().serializeSpecialFloatingPointValues().serializeNulls().create();
	private static final String liveStatsBucketKey = "liveStat;";
	private Cache<String, BasicMetricHour> metricHourCache;
	private Hashtable<String, BasicMetricHour> metricHoursToStoreHash;
	private long metricHoursLastPersited = 0;
	private ExecutorService storageThreadPool = Executors.newFixedThreadPool(8);

	public LevelDBLiveStatisticsDao(DB db, Cache<String, BasicMetricHour> metricHourCache) {
		super();
		this.db = db;
		this.metricHourCache = metricHourCache;
		this.metricHoursToStoreHash  = new Hashtable<String, BasicMetricHour>();
	}

	@Override
	public void storeIncomingStatistics(String guiPath, String accountName, Long timeperiod, String value, ValueType valueType, UnitType unitType) {
		Double valueDouble = LiveStatisticsUtil.parseDouble(value);
        Double calculatedValue = LiveStatisticsUtil.calculateValueBasedOnUnitType(valueDouble, unitType);

        long hoursSince1970 = timeperiod / 240;
        int fifteenSecondPeriodsSinceStartOfHour = LiveStatisticsUtil.getFifteensecondTimeperiodsSinceStartOfHour(timeperiod * 15);

        BasicMetricHour storedMetricHour = getMetricHour(accountName, guiPath, hoursSince1970);
        if (storedMetricHour == null) {
            storedMetricHour = new BasicMetricHour(guiPath, accountName, hoursSince1970, valueType.toString(), unitType.toString());
        }

        Double prevValue = storedMetricHour.getMetrics()[fifteenSecondPeriodsSinceStartOfHour];
        if (prevValue == null) {
            storedMetricHour.getMetrics()[fifteenSecondPeriodsSinceStartOfHour] = calculatedValue;
        } else {
            storedMetricHour.getMetrics()[fifteenSecondPeriodsSinceStartOfHour] = LiveStatisticsUtil.calculateValueBasedOnValueType(prevValue, calculatedValue, valueType);
        }
        
        db.put(bytes(liveStatsBucketKey + accountName + ";" + hoursSince1970 + ";" + guiPath), bytes(gson.toJson(storedMetricHour)));
	}

	@Override
	public void storeIncomingStatistics(List<LiveStatistics> liveStatisticsList) {
		for (LiveStatistics ls : liveStatisticsList) {
            long hoursSince1970 = ls.getTimeperiod() / 240;
            int fifteenSecondPeriodsSinceStartOfHour = LiveStatisticsUtil.getFifteensecondTimeperiodsSinceStartOfHour(ls.getTimeperiod() * 15);
            Double calculatedValue = LiveStatisticsUtil.calculateValueBasedOnUnitType(ls.getValue(), UnitType.fromValue(ls.getUnitType()));

            BasicMetricHour mhToStore = metricHoursToStoreHash.get(ls.getAccountName() + ";" + ls.getGuiPath() + ";" + hoursSince1970);
            boolean wasInStoreHash = mhToStore != null;

            if (mhToStore == null) {
                //Not in store-hash check in metricHourCache
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

            mhToStore.getMetrics()[fifteenSecondPeriodsSinceStartOfHour] = LiveStatisticsUtil.calculateValueBasedOnValueType(ls, calculatedValue, ValueType.fromValue(ls.getValueType()));

            if (!wasInStoreHash) {
                metricHoursToStoreHash.put(ls.getAccountName() + ";" + ls.getGuiPath() + ";" + hoursSince1970, mhToStore);
            }
        }

        persistRecentMetricHours();

	}
	
	private BasicMetricHour getMetricHour(String accountName, String guiPath, long hoursSince1970) {
		return gson.fromJson(asString(db.get(bytes(liveStatsBucketKey + accountName + ";" + hoursSince1970 + ";" + guiPath))), BasicMetricHour.class);
	}
	
	private void persistRecentMetricHours() {
        if ((System.currentTimeMillis() - metricHoursLastPersited) > 10000) {
            //Persist metric hours received in the last 10 seconds

            List<BasicMetricHour> listOne = new ArrayList<BasicMetricHour>();
            listOne.addAll(metricHoursToStoreHash.values());

            storageThreadPool.submit(new StoreMetricHourListThread(listOne, db));
            //storageThreadPool.submit(new StoreMetricHourListThread(listTwo, riakClient));
            //storageThreadPool.submit(new StoreMetricHourListThread(listThree, riakClient));
            //storageThreadPool.submit(new StoreMetricHourListThread(listFour, riakClient));

            logger.info("Persisting metric hours received in the last 10 seconds in 4 threads: " + metricHoursToStoreHash.size());

            metricHoursToStoreHash.clear();
            metricHoursLastPersited = System.currentTimeMillis();
        }
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

            //logger.info("Creating LiveStats for: " + metricHour.getGuiPath() + " at timeperiod: " + metricHour.getHoursSince1970() + " and index: " + index + " with value: " + metricHour.getMetrics()[index]);
            retList.add(new BasicLiveStatistics(metricHour.getGuiPath(), metricHour.getAccountName(), timeperiod, metricHour.getMetrics()[index], metricHour.getValueType(), metricHour.getUnitType()));
        }

        return retList;
    }

	@Override
	public void deleteLiveStatisticsOlderThan(Date date, String accountName) {
		Long toHoursSince1970 = date.getTime() / (15000 * 240);
        
        List<String> keysToDeleteList = new ArrayList<>();
        
        DBIterator iterator = db.iterator();
		iterator.seek(bytes(liveStatsBucketKey + accountName));
		while (iterator.hasNext() && asString(iterator.peekNext().getKey()).startsWith(liveStatsBucketKey + accountName)) {
			String key = asString(iterator.peekNext().getKey());
			BasicMetricHour metricHour = gson.fromJson(asString(iterator.next().getValue()), BasicMetricHour.class);
			if (metricHour.getHoursSince1970() <= toHoursSince1970) {
				keysToDeleteList.add(key);
			}
			
			if (metricHour.getHoursSince1970() > toHoursSince1970) {
				break;
			}
		}
		
		deleteMetricHours(keysToDeleteList);
	}

	private void deleteMetricHours(List<String> keysToDeleteList) {
		WriteBatch batch = db.createWriteBatch();
		try {
			for (String key : keysToDeleteList) {
				batch.delete(bytes(key));
			}
		} finally {
			try {
				batch.close();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}

	@Override
	public void deleteLiveStatisticsBetween(String guiPath, String accountName, Long fromTimeperiod, Long toTimeperiod) {
        List<String> keysToDeleteList = new ArrayList<>();
        
        DBIterator iterator = db.iterator();
		iterator.seek(bytes(liveStatsBucketKey + accountName));
		while (iterator.hasNext() && asString(iterator.peekNext().getKey()).startsWith(liveStatsBucketKey + accountName)) {
			String key = asString(iterator.peekNext().getKey());
			BasicMetricHour metricHour = gson.fromJson(asString(iterator.next().getValue()), BasicMetricHour.class);
			if (metricHour.getHoursSince1970() >= fromTimeperiod && metricHour.getHoursSince1970() <= toTimeperiod) {
				keysToDeleteList.add(key);
			}
			
			if (metricHour.getHoursSince1970() > toTimeperiod) {
				break;
			}
		}
		
		deleteMetricHours(keysToDeleteList);

	}

	@Override
	public void markLiveStatisticsAsCalculated(String guiPath, String accountName, String timeperiod) {
		// TODO Auto-generated method stub

	}

	@Override
	public void markLiveStatisticsAsCalculated(String guiPath, String accountName, Long minTimeperiod, Long maxTimeperiod) {
		// TODO Auto-generated method stub

	}

	@Override
	public void deleteMarkedLiveStatistics() {
		// TODO Auto-generated method stub

	}

}
