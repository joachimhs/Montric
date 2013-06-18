package org.eurekaj.api.datatypes.basic;

import java.util.ArrayList;
import java.util.List;

import org.eurekaj.api.datatypes.Account;

public class BasicAccount implements Account {
	private String id;
    private String accountType;
    private List<String> accessTokens;
    private Long lastEvaluatedForAlerts;

    public BasicAccount() {
    	accessTokens = new ArrayList<>();
    }

    public BasicAccount(Account account) {
        this.id = account.getId();
        this.accountType = account.getAccountType();
        this.accessTokens = account.getAccessTokens();
        this.lastEvaluatedForAlerts = account.getLastEvaluatedForAlerts();
    }

    public BasicAccount(String accountName, String accountType) {
        this.id = accountName;
        this.accountType = accountType;
        accessTokens = new ArrayList<>();
    }

    @Override
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @Override
    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }
    
    @Override
    public List<String> getAccessTokens() {
		return accessTokens;
	}
    
    public void setAccessTokens(List<String> accessTokens) {
		this.accessTokens = accessTokens;
	}

    @Override
    public Long getLastEvaluatedForAlerts() {
    	return lastEvaluatedForAlerts;
    }
    
    public void setLastEvaluatedForAlerts(Long lastEvaluatedForAlerts) {
		this.lastEvaluatedForAlerts = lastEvaluatedForAlerts;
	}
}
