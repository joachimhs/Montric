package org.eurekaj.api.datatypes.basic;

import org.eurekaj.api.datatypes.AccessToken;

public class BasicAccessToken implements AccessToken {
	private String id;
	private String accountName;
	private String accessTokenName;
	
	public BasicAccessToken() {
		// TODO Auto-generated constructor stub
	}
	
	public BasicAccessToken(AccessToken accessToken) {
		this.id = accessToken.getId();
		this.accountName = accessToken.getAccountName();
		this.accessTokenName = accessToken.getAccessTokenName();
	}
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
	public String getAccessTokenName() {
		return this.accessTokenName;
	}
	
	public void setAccessTokenName(String accessTokenName) {
		this.accessTokenName = accessTokenName;
	}
}
