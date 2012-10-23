package org.eurekaj.manager.server.handlers;

import static org.jboss.netty.handler.codec.http.HttpHeaders.isKeepAlive;
import static org.jboss.netty.handler.codec.http.HttpHeaders.setContentLength;
import static org.jboss.netty.handler.codec.http.HttpMethod.GET;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.FORBIDDEN;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.METHOD_NOT_ALLOWED;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.NOT_FOUND;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.OK;
import static org.jboss.netty.handler.codec.http.HttpVersion.HTTP_1_1;

import java.util.concurrent.ConcurrentHashMap;

import org.eurekaj.manager.server.response.CachableHttpResponse;
import org.eurekaj.manager.server.response.CachedChannelBuffer;
import org.jboss.netty.buffer.ChannelBuffer;
import org.jboss.netty.channel.ChannelFuture;
import org.jboss.netty.channel.ChannelFutureListener;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.handler.codec.http.HttpHeaders;
import org.jboss.netty.handler.codec.http.HttpRequest;


public class CacheableFileServerHandler extends FileServerHandler {
    private static ConcurrentHashMap<String, CachedChannelBuffer> cache = new ConcurrentHashMap<String, CachedChannelBuffer>();
    
	public CacheableFileServerHandler(String rootPath, int cacheMaxAge) {
		super(rootPath, cacheMaxAge);
	}
	
	@Override
	public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
		HttpRequest request = (HttpRequest) e.getMessage();
        if (request.getMethod() != GET) {
            sendError(ctx, METHOD_NOT_ALLOWED);
            return;
        }

        String uri = request.getUri();
        
        final String path = sanitizeUri(uri);
        if (path == null) {
            sendError(ctx, FORBIDDEN);
            return;
        }


        ChannelBuffer content = getFileContent(path);
        if (content == null) {
            sendError(ctx, NOT_FOUND);
            return;
        }

        String contentType = getFileTypeMap().getContentType(path);

        CachableHttpResponse response = new CachableHttpResponse(HTTP_1_1, OK);
        response.setRequestUri(request.getUri());
        response.setCacheMaxAge(getCacheMaxAge());
        response.setHeader(HttpHeaders.Names.CONTENT_TYPE, contentType);
        setContentLength(response, content.readableBytes());

        response.setContent(content);
        ChannelFuture writeFuture = e.getChannel().write(response);

        // Decide whether to close the connection or not.
        if (!isKeepAlive(request)) {
            // Close the connection when the whole content is written out.
            writeFuture.addListener(ChannelFutureListener.CLOSE);
        }
	}
	
	@Override
	protected ChannelBuffer getFileContent(String path) {
		ChannelBuffer cb = null;
		
		CachedChannelBuffer ce = cache.get(path);
        if (ce != null && ce.getExpires() > System.currentTimeMillis()) {
        	System.out.println("Getting value for key: " + path + " from cache. Expires in: " + (ce.getExpires() - System.currentTimeMillis()));
            cb = ce.getChannelBuffer();
        } else {
        	System.out.println("Getting value for key: " + path + " from disk/database");
        	cb = super.getFileContent(path);
        	if (getCacheMaxAge() > 0) {
                cache.put(path, new CachedChannelBuffer(cb, System.currentTimeMillis() + getCacheMaxAge() * 1000));
            }
        }
		return cb;
	}
}