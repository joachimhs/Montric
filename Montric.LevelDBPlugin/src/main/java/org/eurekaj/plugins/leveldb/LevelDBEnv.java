package org.eurekaj.plugins.leveldb;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

import org.apache.log4j.Logger;
import org.eurekaj.api.dao.AccountDao;
import org.eurekaj.api.dao.AlertDao;
import org.eurekaj.api.dao.GroupedStatisticsDao;
import org.eurekaj.api.dao.LiveStatisticsDao;
import org.eurekaj.api.dao.SmtpDao;
import org.eurekaj.api.dao.TreeMenuDao;
import org.eurekaj.api.datatypes.basic.BasicMetricHour;
import org.eurekaj.plugins.leveldb.dao.LevelDBAccountDao;
import org.eurekaj.plugins.leveldb.dao.LevelDBAlertDao;
import org.eurekaj.plugins.leveldb.dao.LevelDBGroupedStatisticsDao;
import org.eurekaj.plugins.leveldb.dao.LevelDBEmailRecipientGroupDao;
import org.eurekaj.plugins.leveldb.dao.LevelDBLiveStatisticsDao;
import org.eurekaj.plugins.leveldb.dao.LevelDBTreeMenuDao;
import org.eurekaj.spi.db.EurekaJDBPluginService;
import org.iq80.leveldb.DB;
import org.iq80.leveldb.Options;
import org.iq80.leveldb.impl.Iq80DBFactory;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

public class LevelDBEnv extends EurekaJDBPluginService {
	private Logger logger = Logger.getLogger(LevelDBEnv.class.getName());
	
	private DB db;
	
	private LevelDBAccountDao accountDao;
	private LevelDBAlertDao alertDao;
	private LevelDBEmailRecipientGroupDao emailRecipientDao;
	private LevelDBGroupedStatisticsDao groupedStatisticsDao;
	private LevelDBLiveStatisticsDao liveStatisticsDao;
	private LevelDBTreeMenuDao treeMenuDao;
	
	private Cache<String, BasicMetricHour> metricHourCache;
	
	@Override
	public String getPluginName() {
		return "LevelDBPlugin";
	}

	@Override
	public void setup() {
		String dbPath = System.getProperty("eurekaj.db.absPath");
		if (dbPath == null) {
			throw new RuntimeException("Property eurekaj.db.absPath is NULL.Please configure in config.properties");
		}
		
		Options options = new Options();
		options.createIfMissing(true);
		try {
			db = Iq80DBFactory.factory.open(new File(dbPath), options);
		} catch (IOException e) {
			e.printStackTrace();
			throw new RuntimeException("Unable to initialize LevelDB at path: " + dbPath, e);
		}
		
		metricHourCache = CacheBuilder.newBuilder()
                .concurrencyLevel(4)
                .maximumSize(1000000l)
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .build();
		
		accountDao = new LevelDBAccountDao(db);
		alertDao = new LevelDBAlertDao(db);
		emailRecipientDao = new LevelDBEmailRecipientGroupDao(db);
		groupedStatisticsDao = new LevelDBGroupedStatisticsDao(db);
		liveStatisticsDao = new LevelDBLiveStatisticsDao(db, metricHourCache);
		treeMenuDao = new LevelDBTreeMenuDao(db);
	}

	@Override
	public void tearDown() {
		try {
			db.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	@Override
	public AlertDao getAlertDao() {
		return alertDao;
	}

	@Override
	public GroupedStatisticsDao getGroupedStatisticsDao() {
		return groupedStatisticsDao;
	}

	@Override
	public LiveStatisticsDao getLiveStatissticsDao() {
		return liveStatisticsDao;
	}

	@Override
	public SmtpDao getSmtpDao() {
		return emailRecipientDao;
	}

	@Override
	public TreeMenuDao getTreeMenuDao() {
		return treeMenuDao;
	}

	@Override
	public AccountDao getAccountDao() {
		return accountDao;
	}

}
