package org.eurekaj.plugins.leveldb.dao;

import static org.iq80.leveldb.impl.Iq80DBFactory.*;

import java.util.ArrayList;
import java.util.List;

import org.eurekaj.api.dao.GroupedStatisticsDao;
import org.eurekaj.api.datatypes.GroupedStatistics;
import org.eurekaj.api.datatypes.basic.BasicGroupedStatistics;
import org.iq80.leveldb.DB;
import org.iq80.leveldb.DBIterator;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class LevelDBGroupedStatisticsDao implements GroupedStatisticsDao {
	private DB db;
	private Gson gson = new GsonBuilder().serializeSpecialFloatingPointValues().serializeNulls().create();
	private static final String groupedStatsBucketKey = "groupedStatistics;";

	public LevelDBGroupedStatisticsDao(DB db) {
		super();
		this.db = db;
	}

	@Override
	public void persistGroupInstrumentation(GroupedStatistics groupedStatistics) {
		db.put(bytes(groupedStatsBucketKey + groupedStatistics.getAccountName() + ";" + groupedStatistics.getName()), bytes(gson.toJson(new BasicGroupedStatistics(groupedStatistics))));
	}

	@Override
	public GroupedStatistics getGroupedStatistics(String name, String accountName) {
		String json = asString(db.get(bytes(groupedStatsBucketKey + accountName + ";" + name)));
		BasicGroupedStatistics groupedStats = gson.fromJson(json, BasicGroupedStatistics.class);
		return groupedStats;
	}

	@Override
	public List<GroupedStatistics> getGroupedStatistics(String accountName) {
		List<GroupedStatistics> groupedStatsList = new ArrayList<>();
		
		DBIterator iterator = db.iterator();
		iterator.seek(bytes(groupedStatsBucketKey + accountName));
		while (iterator.hasNext() && asString(iterator.peekNext().getKey()).startsWith(groupedStatsBucketKey + accountName)) {
			BasicGroupedStatistics groupedStat = gson.fromJson(asString(iterator.next().getValue()), BasicGroupedStatistics.class);
			groupedStatsList.add(groupedStat);
		}
		
		return groupedStatsList;
	}

	@Override
	public void deleteGroupedChart(String groupName, String accountName) {
		db.delete(bytes(groupedStatsBucketKey + accountName + ";" + groupName));
	}

}
