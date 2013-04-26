package org.eurekaj.app;

public class Version {
	private String versionId;
	private String upgrdesFrom;
	private String serverJarUrl;
	private String webappJarUrl;
	
	public String getVersionId() {
		return versionId;
	}
	
	public void setVersionId(String versionId) {
		this.versionId = versionId;
	}
	
	public String getUpgrdesFrom() {
		return upgrdesFrom;
	}
	
	public void setUpgrdesFrom(String upgrdesFrom) {
		this.upgrdesFrom = upgrdesFrom;
	}
	
	public String getServerJarUrl() {
		return serverJarUrl;
	}
	
	public void setServerJarUrl(String serverJarUrl) {
		this.serverJarUrl = serverJarUrl;
	}
	
	public String getWebappJarUrl() {
		return webappJarUrl;
	}
	
	public void setWebappJarUrl(String webappJarUrl) {
		this.webappJarUrl = webappJarUrl;
	}

}
