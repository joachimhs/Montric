package org.eurekaj.app;

import java.util.List;

public class Versions {
	private String currentEurekaJVersion;
	private List<Version> eurekaJVersions;
	
	public String getCurrentEurekaJVersion() {
		return currentEurekaJVersion;
	}
	
	public void setCurrentEurekaJVersion(String currentEurekaJVersion) {
		this.currentEurekaJVersion = currentEurekaJVersion;
	}
	
	public List<Version> getEurekaJVersions() {
		return eurekaJVersions;
	}
	
	public void setEurekaJVersions(List<Version> eurekaJVersions) {
		this.eurekaJVersions = eurekaJVersions;
	}
	
}
