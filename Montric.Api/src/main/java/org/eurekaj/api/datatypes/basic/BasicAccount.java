package org.eurekaj.api.datatypes.basic;

import org.eurekaj.api.datatypes.Account;

public class BasicAccount implements Account {
	private String accountName;
    private String accountType;

    public BasicAccount() {
    }

    public BasicAccount(Account account) {
        this.accountName = account.getAccountName();
        this.accountType = account.getAccountType();
    }

    public BasicAccount(String accountName, String accountType) {
        this.accountName = accountName;
        this.accountType = accountType;
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

}
