package org.eurekaj.manager.berkeley;

public class BerkeleyShutdownHook extends Thread {
	private BerkeleyDbEnv dbEnv;

	public BerkeleyShutdownHook() {
		// TODO Auto-generated constructor stub
	}
	
	public void setDbEnv(BerkeleyDbEnv dbEnv) {
		this.dbEnv = dbEnv;
	}
	
	@Override
	public void run() {
		if (dbEnv != null) {
			System.out.println("Shutting down EurekaJ Database");
			dbEnv.close();
		}
	}
}
