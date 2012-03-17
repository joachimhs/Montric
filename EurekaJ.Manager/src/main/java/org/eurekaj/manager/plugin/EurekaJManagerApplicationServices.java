package org.eurekaj.manager.plugin;

import org.eurekaj.api.service.EurekaJApplicationServices;
import org.eurekaj.manager.security.SecurityManager;

public class EurekaJManagerApplicationServices implements EurekaJApplicationServices {
	private static EurekaJManagerApplicationServices applicationServices;
	
	public static EurekaJApplicationServices getInstance() {
		if (applicationServices == null) {
			applicationServices = new EurekaJManagerApplicationServices();
		}
		
		return applicationServices;
	}
	
	public String getLoggedInUsername() {
		return SecurityManager.getAuthenticatedUsername();
	}
}
