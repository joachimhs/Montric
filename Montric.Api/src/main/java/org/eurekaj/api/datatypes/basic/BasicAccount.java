package org.eurekaj.api.datatypes.basic;

import java.util.ArrayList;
import java.util.List;

import org.eurekaj.api.datatypes.Account;

public class BasicAccount implements Account {
	private String accountName;
    private String accountType;
    private List<String> accessTokens;

    public BasicAccount() {
    	accessTokens = new ArrayList<>();
    }

    public BasicAccount(Account account) {
        this.accountName = account.getAccountName();
        this.accountType = account.getAccountType();
        this.accessTokens = account.getAccessTokens();
    }

    public BasicAccount(String accountName, String accountType) {
        this.accountName = accountName;
        this.accountType = accountType;
        accessTokens = new ArrayList<>();
    }

    @Override
    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
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

}
