package org.eurekaj.api.service;

/**
 * This interface defines the services that will be made available from the EurekaJ Manager application to each
 * plugin that overrides the setApplicationServices method. 
 * @author joahaa
 *
 */
public interface EurekaJApplicationServices {
	public String getLoggedInUsername();
}
