package org.eurekaj.spi.webapp;

public abstract class EurekaJWebappPluginService {
	public abstract void start();
	
	public abstract void stop();
	
	public abstract void getStatus();
}
