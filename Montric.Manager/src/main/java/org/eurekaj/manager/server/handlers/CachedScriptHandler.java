package org.eurekaj.manager.server.handlers;

import org.apache.log4j.Logger;
import org.eurekaj.scriptcache.ScriptCache;
import org.eurekaj.scriptcache.ScriptHash;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.handler.codec.http.DefaultHttpResponse;
import org.jboss.netty.handler.codec.http.HttpHeaders;
import org.jboss.netty.handler.codec.http.HttpRequest;

import static org.jboss.netty.handler.codec.http.HttpMethod.GET;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.FORBIDDEN;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.METHOD_NOT_ALLOWED;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.OK;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.NOT_FOUND;
import static org.jboss.netty.handler.codec.http.HttpVersion.HTTP_1_1;

public class CachedScriptHandler extends EurekaJGenericChannelHandler {
	private static Logger logger = Logger.getLogger(CachedScriptHandler.class.getName());
	private String rootPath;
	
	public CachedScriptHandler(String path) {
		this.rootPath = path;
	}


	@Override
	public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
		HttpRequest request = (HttpRequest) e.getMessage();
        if (request.getMethod() != GET) {
            sendError(ctx, METHOD_NOT_ALLOWED);
            return;
        }
        
        String uri = request.getUri();
        if (uri.startsWith("/cachedScript")) {
            uri = uri.substring(13);
        }
        logger.info("CachedScriptHandler uri: " + uri);
        
        String path = sanitizeUri(uri);
        if (path == null) {
            sendError(ctx, FORBIDDEN);
            return;
        }
        
        //Substring out the root path
        if (path.startsWith(rootPath)) {
        	path = path.substring(rootPath.length());
        }
        
        //Substring ut the .js ending
        if (path.endsWith(".js")) {
        	path = path.substring(0, path.length() - 3);
        }
        
        logger.info("CachedScriptHandler path: " + path);
        
        ScriptCache scriptCache = ScriptHash.getScriptCache(path);
        //if there is no cache at the path, return a 404.
        if (scriptCache == null) {
        	sendError(ctx, NOT_FOUND);
        	return;
        }
		
        //Set up and send the response.
        writeContentsToBuffer(ctx, scriptCache.getMinifiedScriptContent(), "application/javascript");
	}
}