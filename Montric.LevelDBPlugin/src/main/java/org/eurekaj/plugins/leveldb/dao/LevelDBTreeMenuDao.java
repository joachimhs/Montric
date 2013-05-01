package org.eurekaj.plugins.leveldb.dao;

import static org.iq80.leveldb.impl.Iq80DBFactory.*;

import java.util.ArrayList;
import java.util.List;

import org.eurekaj.api.dao.TreeMenuDao;
import org.eurekaj.api.datatypes.Statistics;
import org.eurekaj.api.datatypes.basic.BasicStatistics;
import org.iq80.leveldb.DB;
import org.iq80.leveldb.DBIterator;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class LevelDBTreeMenuDao implements TreeMenuDao {
	private DB db;
	private Gson gson = new GsonBuilder().serializeSpecialFloatingPointValues().serializeNulls().create();
	private static final String statsBucketKey = "Statistics;";
	
	public LevelDBTreeMenuDao(DB db) {
		super();
		this.db = db;
	}

	@Override
	public List<Statistics> getTreeMenu(String accountName) {
		List<Statistics> statList = new ArrayList<>();
		
		DBIterator iterator = db.iterator();
		iterator.seek(bytes(statsBucketKey + accountName));
		while (iterator.hasNext() && asString(iterator.peekNext().getKey()).startsWith(statsBucketKey + accountName)) {
			BasicStatistics stat = gson.fromJson(asString(iterator.next().getValue()), BasicStatistics.class);
			statList.add(stat);
		}
		
		return statList;
	}

	@Override
	public Statistics getTreeMenu(String guiPath, String accountName) {
		BasicStatistics stat = gson.fromJson(asString(db.get(bytes(statsBucketKey + accountName + ";" + guiPath))), BasicStatistics.class);
		return stat;
	}

	@Override
	public void deleteTreeMenu(String guiPath, String accountName) {
		db.delete(bytes(statsBucketKey + accountName + ";" + guiPath));
	}

	@Override
	public void persistTreeMenu(Statistics statistics) {
		db.put(bytes(statsBucketKey + statistics.getAccountName() + ";" + statistics.getGuiPath()), bytes(gson.toJson(new BasicStatistics(statistics))));		
	}

}
