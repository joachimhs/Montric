package org.eurekaj.api.datatypes.basic;

import org.eurekaj.api.datatypes.Session;

public class BasicSession implements Session {
	private String uuid;
	private String email;
	private String accountName;
	private Long expiry;
	
	public BasicSession() {
		// TODO Auto-generated constructor stub
	}
	
	public BasicSession(Session session) {
		this.uuid = session.getUuid();
		this.email = session.getEmail();
		this.accountName = session.getAccountName();
		this.expiry = session.getExpiry();
	}
	
	@Override
	public String getUuid() {
		return uuid;
	}
	
	public void setUuid(String uuid) {
		this.uuid = uuid;
	}

	@Override
	public String getEmail() {
		return email;
	}
	
	public void setEmail(String email) {
		this.email = email;
	}

	@Override
	public String getAccountName() {
		return accountName;
	}
	
	public void setAccountName(String accountName) {
		this.accountName = accountName;
	}

	@Override
	public Long getExpiry() {
		return expiry;
	}
	
	public void setExpiry(Long expiry) {
		this.expiry = expiry;
	}
}
