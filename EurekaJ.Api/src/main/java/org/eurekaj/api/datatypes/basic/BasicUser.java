package org.eurekaj.api.datatypes.basic;

import org.eurekaj.api.datatypes.User;

public class BasicUser implements User {
	private String userName;
	private String accountName;
	private String userRole;
	
	public BasicUser() {
	
	}
	
	public BasicUser(User user) {
		this(user.getUserName(), user.getAccountName(), user.getUserRole());
	}
	
	public BasicUser(String username, String accountName, String userRole) {
		this.userName = username;
		this.accountName = accountName;
		this.userRole = userRole;
	}
	
	@Override
	public String getUserName() {
		return userName;
	}
	
	public void setUserName(String username) {
		this.userName = username;
	}

	@Override
	public String getAccountName() {
		return accountName;
	}

	public void setAccountName(String accountName) {
		this.accountName = accountName;
	}
	
	@Override
	public String getUserRole() {
		return userRole;
	}

	public void setUserRole(String userRole) {
		this.userRole = userRole;
	}
}
