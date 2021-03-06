package org.eurekaj.manager.datatypes;

import java.util.List;

import org.eurekaj.api.datatypes.Account;

/**
 * Created with IntelliJ IDEA.
 * User: joahaa
 * Date: 2/4/13
 * Time: 4:28 PM
 * To change this template use File | Settings | File Templates.
 */
public class ManagerAccount implements Account {
    private String id;
    private String accountType;
    private List<String> accessTokens;
    private Long lastEvaluatedForAlerts;

    public ManagerAccount() {
    }

    public ManagerAccount(String id, String accountType) {
        this.id = id;
        this.accountType = accountType;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    @Override
    public String getId() {
        return id;
    }

    public void id(String id) {
        this.id = id;
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
