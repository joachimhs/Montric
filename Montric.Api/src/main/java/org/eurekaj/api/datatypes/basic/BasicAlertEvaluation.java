package org.eurekaj.api.datatypes.basic;

import org.eurekaj.api.datatypes.AlertEvaluation;

public class BasicAlertEvaluation implements AlertEvaluation {
	private String id;
	private String accountName;
	private String queue;
	
	@Override
	public String getId() {
		return id;
	}
	
	public void setId(String id) {
		this.id = id;
	}

	@Override
	public String getAccountName() {
		return accountName;
	}
	
	public void setAccountName(String accountName) {
		this.accountName = accountName;
	}

	@Override
	public String getQueue() {
		return queue;
	}

	public void setQueue(String queue) {
		this.queue = queue;
	}
}
