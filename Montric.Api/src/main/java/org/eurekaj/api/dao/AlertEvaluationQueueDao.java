package org.eurekaj.api.dao;

import java.util.List;

import org.eurekaj.api.datatypes.Account;

public interface AlertEvaluationQueueDao {
	public void addAccountNamesToNewQueue(List<String> accountNameList);
	
	public void addAccountsToNewQueue(List<Account> accountList);
	
	public String getNextAccountToEvaluateAndMarkAsEvaluating();
	
	public void deleteAccountFromEvaluationQueue(String accountName);
}
