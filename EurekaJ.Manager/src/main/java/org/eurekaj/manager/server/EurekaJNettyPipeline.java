package org.eurekaj.manager.server;

import java.io.File;
import java.util.LinkedHashMap;

import org.apache.log4j.Logger;
import org.eurekaj.manager.server.handlers.*;
import org.eurekaj.manager.server.router.RouterHandler;
import org.jboss.netty.channel.ChannelHandler;
import org.jboss.netty.channel.ChannelPipeline;
import org.jboss.netty.channel.ChannelPipelineFactory;
import org.jboss.netty.channel.Channels;
import org.jboss.netty.handler.codec.http.HttpChunkAggregator;
import org.jboss.netty.handler.codec.http.HttpRequestDecoder;
import org.jboss.netty.handler.codec.http.HttpResponseEncoder;
import org.jboss.netty.handler.stream.ChunkedWriteHandler;

public class EurekaJNettyPipeline implements ChannelPipelineFactory {
	private static Logger logger = Logger.getLogger(EurekaJNettyPipeline.class.getName());
	private RouterHandler routerHandler = null;
	
	public EurekaJNettyPipeline() {
		
	}
	
	@Override
	public ChannelPipeline getPipeline() throws Exception {
		ChannelPipeline pipeline = Channels.pipeline();
        pipeline.addLast("decoder", new HttpRequestDecoder());
        pipeline.addLast("aggregator", new HttpChunkAggregator(1048576));
        pipeline.addLast("encoder", new HttpResponseEncoder());
        pipeline.addLast("chunkedWriter", new ChunkedWriteHandler());

        if (routerHandler == null) {
        	logger.info("Building routerHandler for pipeline");
        	LinkedHashMap<String, ChannelHandler> routes = new LinkedHashMap<String, ChannelHandler>();
            routes.put("startsWith:/mainMenu.json", new MainMenuChannelHandler());
            routes.put("equals:/main_menu_models", new MainMenuChannelHandler());
            routes.put("startsWith:/admin_menu_models", new MainMenuChannelHandler());
            routes.put("startsWith:/chart_models", new ChartChannelHandler());
            routes.put("startsWith:/alert_models", new AlertChannelHandler());
            routes.put("startsWith:/email_group_models", new EmailChannelHandler());
            routes.put("startsWith:/chart_group_models", new InstrumentationGroupChannelHandler());
            routes.put("equals:/liveStatistics", new LiveStatisticsChannelHandler());
            routes.put("equals:/user", new UserChannelhandler());
            routes.put("equals:/account", new AccountHandler());

            String webappDir = System.getProperty("basedir");
            
    		routerHandler = new RouterHandler(routes, false, new CacheableFileServerHandler(webappDir, 0));
        }
        
        pipeline.addLast("handler_routeHandler", routerHandler);
        return pipeline;
	}

	
}
