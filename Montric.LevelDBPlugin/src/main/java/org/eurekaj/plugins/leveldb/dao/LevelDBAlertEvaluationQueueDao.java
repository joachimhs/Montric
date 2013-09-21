package org.eurekaj.plugins.leveldb.dao;

import static org.iq80.leveldb.impl.Iq80DBFactory.asString;
import static org.iq80.leveldb.impl.Iq80DBFactory.bytes;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;

import org.apache.log4j.Logger;
import org.eurekaj.api.dao.AlertEvaluationQueueDao;
import org.eurekaj.api.datatypes.Account;
import org.eurekaj.api.datatypes.AlertEvaluation;
import org.eurekaj.api.datatypes.basic.BasicAlertEvaluation;
import org.iq80.leveldb.DB;
import org.iq80.leveldb.DBIterator;
import org.iq80.leveldb.WriteBatch;

import com.google.gson.Gson;

public class LevelDBAlertEvaluationQueueDao implements AlertEvaluationQueueDao {
	private Logger logger = Logger.getLogger(LevelDBAlertEvaluationQueueDao.class.getName());
	
	private DB db;
	private static final String alertEvaluationQueueBucketKey = "AlertEvaluationQueue;";
	
	public LevelDBAlertEvaluationQueueDao(DB db) {
		this.db = db;
	}
	
	@Override
	public void addAccountsToNewQueue(List<Account> accountList) {
		List<String> accountNameList = new ArrayList<>();
		for (Account account : accountList) {
			accountNameList.add(account.getId());
		}
		
		this.addAccountNamesToNewQueue(accountNameList);		
	}
	
	@Override
	public void addAccountNamesToNewQueue(List<String> accountNameList) {
		Hashtable<String, AlertEvaluation> alertEvaluationHash = new Hashtable<>();

		//Fetch any account already in the new queue and add the new AlertEvaluations to the new queue
		DBIterator iterator = db.iterator();
		iterator.seek(bytes(alertEvaluationQueueBucketKey + ";new"));
		while (iterator.hasNext() && asString(iterator.peekNext().getKey()).startsWith(alertEvaluationQueueBucketKey + ";new")) {
			BasicAlertEvaluation alertEvaluation = new Gson().fromJson(asString(iterator.next().getValue()), BasicAlertEvaluation.class);
			alertEvaluationHash.put(alertEvaluation.getAccountName(), alertEvaluation);
		}
		
		//Add only the new AlertEvaluations to the new queue
		List<BasicAlertEvaluation> alertEvaluationsToAdd = new ArrayList<>();
		for (String accountName : accountNameList) {
			if (alertEvaluationHash.get(accountName) == null) {
				BasicAlertEvaluation newAlertEvaluation = new BasicAlertEvaluation();
				newAlertEvaluation.setId(accountName);
				newAlertEvaluation.setAccountName(accountName);
				newAlertEvaluation.setQueue("new");
				alertEvaluationsToAdd.add(newAlertEvaluation);
			}
		}
		
		//Write the new Alert Evaluations to the new queue
		WriteBatch batch = db.createWriteBatch();
		try {
			for (BasicAlertEvaluation alertEvaluation : alertEvaluationsToAdd) {
				batch.put(bytes(alertEvaluationQueueBucketKey + ";new;" + alertEvaluation.getAccountName()), bytes(new Gson().toJson(alertEvaluation)));
			}
			
			db.write(batch);
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
	public synchronized String getNextAccountToEvaluateAndMarkAsEvaluating() {
		BasicAlertEvaluation nextAccount = null;
		
		DBIterator iterator = db.iterator();
		iterator.seek(bytes(alertEvaluationQueueBucketKey + ";new"));
		while (iterator.hasNext() && asString(iterator.peekNext().getKey()).startsWith(alertEvaluationQueueBucketKey + ";new")) {
			BasicAlertEvaluation alertEvaluation = new Gson().fromJson(asString(iterator.next().getValue()), BasicAlertEvaluation.class);
			nextAccount = alertEvaluation;
			break;
		}
		
		//Write the new Alert Evaluations to the new queue
		if (nextAccount != null) {
			db.delete(bytes(alertEvaluationQueueBucketKey + ";new;" + nextAccount.getAccountName()));
			nextAccount.setQueue("evaluating");
			db.put(bytes(alertEvaluationQueueBucketKey + ";" + nextAccount.getQueue() + ";" + nextAccount.getAccountName()), bytes(new Gson().toJson(nextAccount)));
			return nextAccount.getAccountName();
		} else {
			return null;
		}
	}

	@Override
	public void deleteAccountFromEvaluationQueue(String accountName) {
		db.delete(bytes(alertEvaluationQueueBucketKey + ";evaluating;" + accountName));
	}

}
