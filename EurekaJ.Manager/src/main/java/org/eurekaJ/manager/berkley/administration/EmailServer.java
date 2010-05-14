package org.eurekaJ.manager.berkley.administration;

import com.sleepycat.persist.model.Entity;
import com.sleepycat.persist.model.PrimaryKey;

@Entity(version=2)
public class EmailServer implements Comparable<EmailServer>{
	@PrimaryKey private String smtpServer;
	private String username;
	private String password;
	private boolean useSSL = false;
	private int port = 25;
	
	public EmailServer() {
		super();
	}
	
	public String getSmtpServer() {
		return smtpServer;
	}
	
	public void setSmtpServer(String smtpServer) {
		this.smtpServer = smtpServer;
	}
	
	public String getUsername() {
		return username;
	}
	
	public void setUsername(String username) {
		this.username = username;
	}
	
	public String getPassword() {
		return password;
	}
	
	public void setPassword(String password) {
		this.password = password;
	}
	
	public boolean isUseSSL() {
		return useSSL;
	}
	
	public void setUseSSL(boolean useSSL) {
		this.useSSL = useSSL;
	}
	
	public int getPort() {
		return port;
	}
	
	public void setPort(int port) {
		this.port = port;
	}
	
	@Override
	public int compareTo(EmailServer other) {
		if (other == null || other.getSmtpServer() == null) {
			return 1;
		}
		
		if (this.getSmtpServer() == null) {
			return -1;
		}
		
		return this.getSmtpServer().compareTo(other.getSmtpServer());
	}
	
}
