package org.eurekaj.api.datatypes;

public interface Session {
	public String getUuid();
	public String getEmail();
	public String getAccountName();
	public Long getExpiry();
}
