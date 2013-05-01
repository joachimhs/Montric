package org.eurekaj.plugins.leveldb.dao;

import static org.iq80.leveldb.impl.Iq80DBFactory.*;

import java.io.IOException;
import java.util.List;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.basic.BasicMetricHour;
import org.iq80.leveldb.DB;
import org.iq80.leveldb.WriteBatch;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class StoreMetricHourListThread implements Runnable {
	private Logger logger = Logger.getLogger(StoreMetricHourListThread.class.getName());
    private List<BasicMetricHour> metricHourList;
    private DB db;
    private static final String liveStatsBucketKey = "liveStat;";
    private Gson gson = new GsonBuilder().serializeSpecialFloatingPointValues().serializeNulls().create();
    
    public StoreMetricHourListThread(List<BasicMetricHour> metricHourList, DB db) {
		this.metricHourList = metricHourList;
		this.db = db;
	}
    
	@Override
	public void run() {
		WriteBatch batch = db.createWriteBatch();
		
		try {
			for (BasicMetricHour metricHour : metricHourList) {
				batch.put(bytes(liveStatsBucketKey + metricHour.getAccountName() + ";" + metricHour.getHoursSince1970() + ";" + metricHour.getGuiPath()), bytes(gson.toJson(metricHour)));
			}
		} finally {
			try {
				batch.close();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		
		db.write(batch);
		
	}

}
