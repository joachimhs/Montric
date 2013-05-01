package org.eurekaj.plugins.leveldb.dao;

import static org.iq80.leveldb.impl.Iq80DBFactory.*;

import java.util.ArrayList;
import java.util.List;

import org.eurekaj.api.dao.AlertDao;
import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.datatypes.TriggeredAlert;
import org.eurekaj.api.datatypes.basic.BasicAlert;
import org.eurekaj.api.datatypes.basic.BasicTriggeredAlert;
import org.iq80.leveldb.DB;
import org.iq80.leveldb.DBIterator;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class LevelDBAlertDao implements AlertDao {
	private DB db;
	private Gson gson = new GsonBuilder().serializeSpecialFloatingPointValues().serializeNulls().create();
	private static final String alertBucketKey = "alert;";
	private static final String triggeredAlertlertBucketKey = "triggeredAlert;";

	public LevelDBAlertDao(DB db) {
		super();
		this.db = db;
	}

	@Override
	public void persistAlert(Alert alert) {
		db.put(bytes(alertBucketKey + alert.getAccountName() + ";" + alert.getAlertName()), bytes(gson.toJson(new BasicAlert(alert))));
	}

	@Override
	public Alert getAlert(String alertName, String accountName) {
		String json = asString(db.get(bytes(alertBucketKey + accountName + ";" + alertName)));
		BasicAlert alert = gson.fromJson(json, BasicAlert.class);
		return alert;
	}

	@Override
	public List<Alert> getAlerts(String accountName) {
		List<Alert> alertList = new ArrayList<>();

		DBIterator iterator = db.iterator();
		iterator.seek(bytes(alertBucketKey + accountName));
		while (iterator.hasNext() && asString(iterator.peekNext().getKey()).startsWith(alertBucketKey + accountName)) {
			BasicAlert alert = gson.fromJson(asString(iterator.next().getValue()), BasicAlert.class);
			alertList.add(alert);
		}

		return alertList;
	}

	@Override
	public void deleteAlert(String alertName, String accountName) {
		db.delete(bytes(alertBucketKey + accountName + ";" + alertName));
	}

	@Override
	public void persistTriggeredAlert(TriggeredAlert triggeredAlert) {
		db.put(bytes(triggeredAlertlertBucketKey + triggeredAlert.getAccountName() + ";" + triggeredAlert.getAlertName() + ";" + triggeredAlert.getTimeperiod()),
				bytes(gson.toJson(new BasicTriggeredAlert(triggeredAlert))));
	}

	@Override
	public List<TriggeredAlert> getTriggeredAlerts(String accountName, Long fromTimeperiod, Long toTimeperiod) {
		List<TriggeredAlert> triggeredAlertList = new ArrayList<>();
		
		DBIterator iterator = db.iterator();
		iterator.seek(bytes(triggeredAlertlertBucketKey + accountName));
		while (iterator.hasNext() && asString(iterator.peekNext().getKey()).startsWith(triggeredAlertlertBucketKey + accountName)) {
			BasicTriggeredAlert triggeredAlert = gson.fromJson(asString(iterator.next().getValue()), BasicTriggeredAlert.class);
			if (triggeredAlert.getTriggeredTimeperiod() >= fromTimeperiod && triggeredAlert.getTriggeredTimeperiod() <= toTimeperiod) {
				triggeredAlertList.add(triggeredAlert);
			}
		}
		
		return triggeredAlertList;
	}

	@Override
	public List<TriggeredAlert> getTriggeredAlerts(String alertname, String accountName, Long fromTimeperiod, Long toTimeperiod) {
List<TriggeredAlert> triggeredAlertList = new ArrayList<>();
		
		DBIterator iterator = db.iterator();
		iterator.seek(bytes(triggeredAlertlertBucketKey + accountName + ";" + alertname));
		while (iterator.hasNext() && asString(iterator.peekNext().getKey()).startsWith(triggeredAlertlertBucketKey + accountName + ";" + alertname)) {
			BasicTriggeredAlert triggeredAlert = gson.fromJson(asString(iterator.next().getValue()), BasicTriggeredAlert.class);
			if (triggeredAlert.getTriggeredTimeperiod() >= fromTimeperiod && triggeredAlert.getTriggeredTimeperiod() <= toTimeperiod) {
				triggeredAlertList.add(triggeredAlert);
			}
		}
		
		return triggeredAlertList;
	}

	@Override
	public List<TriggeredAlert> getRecentTriggeredAlerts(String accountName, int numAlerts) {
		List<TriggeredAlert> triggeredAlertList = new ArrayList<>();
		
		DBIterator iterator = db.iterator();
		iterator.seek(bytes(triggeredAlertlertBucketKey + accountName));
		int foundAlerts = 0;
		while (iterator.hasNext() && asString(iterator.peekNext().getKey()).startsWith(triggeredAlertlertBucketKey + accountName)) {
			BasicTriggeredAlert triggeredAlert = gson.fromJson(asString(iterator.next().getValue()), BasicTriggeredAlert.class);
			triggeredAlertList.add(triggeredAlert);
			foundAlerts++;
			if (foundAlerts >= numAlerts) { break; }
		}
		
		return triggeredAlertList;
	}

}
