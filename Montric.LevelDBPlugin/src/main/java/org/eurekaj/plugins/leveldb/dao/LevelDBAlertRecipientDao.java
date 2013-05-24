package org.eurekaj.plugins.leveldb.dao;

import static org.iq80.leveldb.impl.Iq80DBFactory.asString;
import static org.iq80.leveldb.impl.Iq80DBFactory.bytes;

import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.eurekaj.api.dao.AlertRecipientDao;
import org.eurekaj.api.datatypes.AlertRecipient;
import org.eurekaj.api.datatypes.basic.BasicAlertRecipient;
import org.iq80.leveldb.DB;
import org.iq80.leveldb.DBIterator;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class LevelDBAlertRecipientDao implements AlertRecipientDao {
	private static final Logger logger = Logger.getLogger(LevelDBAlertRecipientDao.class.getName());
	private DB db;
	private Gson gson = new GsonBuilder().serializeSpecialFloatingPointValues().serializeNulls().create();
	private static final String alertRecipientBucketKey = "alertRecipient;";
	
	public LevelDBAlertRecipientDao(DB db) {
		super();
		this.db = db;
	}
	
	@Override
	public List<AlertRecipient> getAlertRecipients(String accountName) {
		List<AlertRecipient> alertRecipientList = new ArrayList<>();

		DBIterator iterator = db.iterator();
		iterator.seek(bytes(alertRecipientBucketKey + accountName));
		while (iterator.hasNext() && asString(iterator.peekNext().getKey()).startsWith(alertRecipientBucketKey + accountName)) {
			BasicAlertRecipient alert = gson.fromJson(asString(iterator.next().getValue()), BasicAlertRecipient.class);
			alertRecipientList.add(alert);
		}

		return alertRecipientList;
	}

	@Override
	public AlertRecipient getAlertRecipient(String accountName, String alertRecipientName) {
		String json = asString(db.get(bytes(alertRecipientBucketKey + accountName + ";" + alertRecipientName)));
		BasicAlertRecipient alertRecipient = gson.fromJson(json, BasicAlertRecipient.class);
		return alertRecipient;
	}

	@Override
	public void persistAlertRecipient(AlertRecipient alertRecipient) {
		db.put(bytes(alertRecipientBucketKey + alertRecipient.getAccountName() + ";" +  alertRecipient.getId()), bytes(gson.toJson(new BasicAlertRecipient(alertRecipient))));		
	}
	
	@Override
	public void deleteAlertRecipient(AlertRecipient alertRecipient) {
		this.deleteAlertRecipient(alertRecipient.getAccountName(), alertRecipient.getAccountName());
	}

	@Override
	public void deleteAlertRecipient(String accountName, String id) {
		db.delete(bytes(alertRecipientBucketKey + accountName + ";" + id));
	}
}
