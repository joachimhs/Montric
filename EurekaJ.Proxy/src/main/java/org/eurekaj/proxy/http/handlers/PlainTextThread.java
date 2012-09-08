package org.eurekaj.proxy.http.handlers;

import org.apache.http.examples.client.ClientGZipContentCompression;
import org.apache.log4j.Logger;
import org.eclipse.jetty.server.Server;

public class PlainTextThread implements Runnable{
	private Logger log = Logger.getLogger(PlainTextThread.class.getName());
	private ClientGZipContentCompression gzipClient;
	
	public PlainTextThread(ClientGZipContentCompression gzipClient) {
		this.gzipClient = gzipClient;
	}
	
	@Override
	public void run() {
		Integer ptpPortInt = PlainTextProtocolHandler.parseInteger(System.getProperty("org.eurekaj.proxy.PTPPort"), new Integer(8108));
    	log.info("Starting PTP Server at port: " + ptpPortInt);
    	Server server = new Server(ptpPortInt);
        try {
        	server.setHandler(new PlainTextProtocolHandler(gzipClient));
			server.start();
			server.join();
        } catch (Exception e) {
			log.error("Unable to start PTP listener on port " + ptpPortInt);
			e.printStackTrace();
		}
        
        log.info("Started PTP listener or port: "+ ptpPortInt);
		
	}
}
