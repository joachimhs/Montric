package org.eurekaj.plugins.riak.dao;

import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;

import org.eurekaj.api.dao.AlertEvaluationQueueDao;
import org.eurekaj.api.datatypes.Account;
import org.eurekaj.api.datatypes.AlertEvaluation;
import org.eurekaj.api.datatypes.basic.BasicAlertEvaluation;

import com.basho.riak.client.IRiakClient;

public class RiakAlertEvaluationQueueDao implements AlertEvaluationQueueDao {
	private IRiakClient riakClient;
	private static final String alertEvaluationQueueBucketKey = "AlertEvaluationQueue";
	private static final String newAlertEvaluationQueueBucketKey = "AlertEvaluationQueue;new";
	
	public RiakAlertEvaluationQueueDao(IRiakClient riakClient) {
		this.riakClient = riakClient;
	}
	
	@Override
	public void addAccountNamesToNewQueue(List<String> accountNameList) {
		Hashtable<String, AlertEvaluation> alertEvaluationHash = new Hashtable<>();
		
		for (BasicAlertEvaluation alertEvaluation: RiakAbstractDao.getListFromRiakBucket(riakClient, newAlertEvaluationQueueBucketKey, new BasicAlertEvaluation(), BasicAlertEvaluation.class)) {
			if (alertEvaluation != null && alertEvaluation.getAccountName() != null) {
				alertEvaluationHash.put(alertEvaluation.getAccountName(), alertEvaluation);
			}
		}
		
		//Add only the new AlertEvaluations to the new queue
		List<BasicAlertEvaluation> alertEvaluationsToAdd = new ArrayList<>();
		for (String account : accountNameList) {
			if (alertEvaluationHash.get(account) == null) {
				BasicAlertEvaluation newAlertEvaluation = new BasicAlertEvaluation();
				newAlertEvaluation.setId(account);
				newAlertEvaluation.setAccountName(account);
				newAlertEvaluation.setQueue("new");
				alertEvaluationsToAdd.add(newAlertEvaluation);
			}
		}
		
		for (BasicAlertEvaluation alertEvaluation : alertEvaluationsToAdd) {
			RiakAbstractDao.persistObjectInBucket(riakClient, newAlertEvaluationQueueBucketKey, alertEvaluation.getAccountName(), alertEvaluation);
		}
		
	}
	
	@Override
	public void addAccountsToNewQueue(List<Account> accountList) {
		List<String> accountNameList = new ArrayList<>();
		for (Account account : accountList) {
			accountNameList.add(account.getId());
		}
		
		addAccountNamesToNewQueue(accountNameList);
	}
	
	@Override
	public void deleteAccountFromEvaluationQueue(String accountName) {
		RiakAbstractDao.deleteObjectInBucket(riakClient, alertEvaluationQueueBucketKey + ";evaluating", accountName);
	}
	
	@Override
	public String getNextAccountToEvaluateAndMarkAsEvaluating() {
		BasicAlertEvaluation nextAccount = null;
		
		for (BasicAlertEvaluation alertEvaluation: RiakAbstractDao.getListFromRiakBucket(riakClient, newAlertEvaluationQueueBucketKey, new BasicAlertEvaluation(), BasicAlertEvaluation.class)) {
			nextAccount = alertEvaluation;
			break;
		}
		
		
		if (nextAccount != null) {
			RiakAbstractDao.deleteObjectInBucket(riakClient, newAlertEvaluationQueueBucketKey, nextAccount.getAccountName());
			nextAccount.setQueue("evaluating");
			RiakAbstractDao.persistObjectInBucket(riakClient, alertEvaluationQueueBucketKey + ";" + nextAccount.getQueue(),  nextAccount.getAccountName(), nextAccount);
			return nextAccount.getId();
		} else {
			return null;
		}
	}
}
