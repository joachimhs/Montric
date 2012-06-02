package org.eurekaj.manager.server;

import java.io.File;
import java.util.LinkedHashMap;

import org.apache.log4j.Logger;
import org.eurekaj.manager.server.handlers.CacheableFileServerHandler;
import org.eurekaj.manager.server.router.RouterHandler;
import org.eurekaj.manager.servlets.AlertChannelHandler;
import org.eurekaj.manager.servlets.ChartChannelHandler;
import org.eurekaj.manager.servlets.EmailChannelHandler;
import org.eurekaj.manager.servlets.InstrumentationGroupChannelHandler;
import org.eurekaj.manager.servlets.InstrumentationMenuChannelHandler;
import org.eurekaj.manager.servlets.LiveStatisticsChannelHandler;
import org.eurekaj.manager.servlets.UserChannelhandler;
import org.jboss.netty.channel.ChannelHandler;
import org.jboss.netty.channel.ChannelPipeline;
import org.jboss.netty.channel.ChannelPipelineFactory;
import org.jboss.netty.channel.Channels;
import org.jboss.netty.handler.codec.http.HttpChunkAggregator;
import org.jboss.netty.handler.codec.http.HttpRequestDecoder;
import org.jboss.netty.handler.codec.http.HttpResponseEncoder;
import org.jboss.netty.handler.stream.ChunkedWriteHandler;

public class EurekaJNetyPipeline implements ChannelPipelineFactory {
	private static Logger logger = Logger.getLogger(EurekaJNetyPipeline.class.getName());
	
	public EurekaJNetyPipeline() {
		// TODO Auto-generated constructor stub
	}
	
	@Override
	public ChannelPipeline getPipeline() throws Exception {
		logger.info("Getting pipeline from: " + EurekaJNetyPipeline.class.getName());
		
		ChannelPipeline pipeline = Channels.pipeline();

        // Uncomment the following line if you want HTTPS
        //SSLEngine engine = SecureChatSslContextFactory.getServerContext().createSSLEngine();
        //engine.setUseClientMode(false);
        //pipeline.addLast("ssl", new SslHandler(engine));

        pipeline.addLast("decoder", new HttpRequestDecoder());
        pipeline.addLast("aggregator", new HttpChunkAggregator(65536));
        pipeline.addLast("encoder", new HttpResponseEncoder());
        pipeline.addLast("chunkedWriter", new ChunkedWriteHandler());

        LinkedHashMap<String, ChannelHandler> routes = new LinkedHashMap<String, ChannelHandler>();
        routes.put("equals:/instrumentationMenu", new InstrumentationMenuChannelHandler());
        routes.put("equals:/chart", new ChartChannelHandler());
        routes.put("equals:/alert", new AlertChannelHandler());
        routes.put("equals:/email", new EmailChannelHandler());
        routes.put("equals:/instrumentationGroup", new InstrumentationGroupChannelHandler());
        routes.put("equals:/liveStatistics", new LiveStatisticsChannelHandler());
        routes.put("equals:/user", new UserChannelhandler());
        
        String webappDir = System.getProperty("basedir") + File.separatorChar + "tmp";
        pipeline.addLast("handler_routeHandler", new RouterHandler(routes, false, new CacheableFileServerHandler(webappDir, 60)));
        return pipeline;
	}

	
}
