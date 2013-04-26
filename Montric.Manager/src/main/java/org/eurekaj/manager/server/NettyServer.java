package org.eurekaj.manager.server;

import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

import org.apache.log4j.Logger;
import org.eurekaj.api.util.IntegerParser;
import org.eurekaj.spi.webapp.EurekaJWebappPluginService;
import org.jboss.netty.bootstrap.ServerBootstrap;
import org.jboss.netty.channel.socket.nio.NioServerSocketChannelFactory;

public class NettyServer extends EurekaJWebappPluginService {
	private static Logger logger = Logger.getLogger(NettyServer.class.getName());
	private ServerBootstrap bootstrap;
	
	@Override
	public void start() {
		bootstrap = new ServerBootstrap(
                new NioServerSocketChannelFactory(
                        Executors.newCachedThreadPool(),
                        Executors.newCachedThreadPool()));

        // Set up the event pipeline factory          .
        bootstrap.setPipelineFactory(new EurekaJNettyPipeline());

        Integer port = IntegerParser.parseIntegerFromString(System.getProperty("org.eurekaj.port"), 8080);
        // Bind and start to accept incoming connections.
        bootstrap.bind(new InetSocketAddress(port));
		
        logger.info("Using DB Plugin: " + System.getProperty("eurekaj.db.type"));
        logger.info("EurekaJ Manager loaded and listening to port: " + port);
	}
	
	@Override
	public void stop() {
		// TODO Auto-generated method stub
		
	}
	
	@Override
	public void getStatus() {
		// TODO Auto-generated method stub
		
	}
	
	public static void main(String[] args) {
		NettyServer nettyServer = new NettyServer();
		
		System.setProperty("basedir", "/Users/jhsmbp/Projects/Montric/Montric.View/src/main/webapp");
		//System.setProperty("basedir", "/Users/joahaa/Projects/HaagenSoftwareWeb");
		System.setProperty("eurekaj.db.absPath", "/srv/eurekaj/eurekajData");
		System.setProperty("org.eurekaj.deleteStatsOlderThanDays", "180");
		System.setProperty("eurekaj.db.type", "LevelDBPlugin");
		System.setProperty("org.eurekaj.port", "8081");
		System.setProperty("org.eurekaj.indexCacheSeconds", "0");
		
		nettyServer.start();
	}
}
