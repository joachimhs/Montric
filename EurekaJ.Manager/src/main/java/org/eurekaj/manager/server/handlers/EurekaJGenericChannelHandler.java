package org.eurekaj.manager.server.handlers;

import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.CONTENT_TYPE;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.OK;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.NOT_FOUND;
import static org.jboss.netty.handler.codec.http.HttpVersion.HTTP_1_1;

import org.apache.log4j.Logger;
import org.eurekaj.manager.service.AdministrationService;
import org.eurekaj.manager.service.AdministrationServiceImpl;
import org.eurekaj.manager.service.TreeMenuService;
import org.eurekaj.manager.service.TreeMenuServiceImpl;
import org.jboss.netty.buffer.ChannelBuffer;
import org.jboss.netty.buffer.ChannelBuffers;
import org.jboss.netty.channel.ChannelFutureListener;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.channel.SimpleChannelUpstreamHandler;
import org.jboss.netty.handler.codec.http.DefaultHttpResponse;
import org.jboss.netty.handler.codec.http.HttpMethod;
import org.jboss.netty.handler.codec.http.HttpRequest;
import org.jboss.netty.handler.codec.http.HttpResponse;
import org.jboss.netty.util.CharsetUtil;

public class EurekaJGenericChannelHandler extends SimpleChannelUpstreamHandler {
	private static Logger log = Logger.getLogger(EurekaJGenericChannelHandler.class.getName());
	private TreeMenuService berkeleyTreeMenuService;
    private AdministrationService administrationService;

    public AdministrationService getAdministrationService() {
        if (administrationService == null) {
            administrationService = new AdministrationServiceImpl();
        }
        return administrationService;
    }

    public TreeMenuService getBerkeleyTreeMenuService() {
        if (berkeleyTreeMenuService == null) {
            berkeleyTreeMenuService = new TreeMenuServiceImpl();
        }
        return berkeleyTreeMenuService;
    }
    
    public boolean isPut(MessageEvent e) {
    	HttpRequest request = (HttpRequest) e.getMessage();
		HttpMethod method = request.getMethod();
		return method == HttpMethod.PUT;
    }
    
    public boolean isGet(MessageEvent e) {
    	HttpRequest request = (HttpRequest) e.getMessage();
		HttpMethod method = request.getMethod();
		return method == HttpMethod.GET;
    }
    
    public boolean isDelete(MessageEvent e) {
    	HttpRequest request = (HttpRequest) e.getMessage();
		HttpMethod method = request.getMethod();
		return method == HttpMethod.DELETE;
    }
    
    public String getHttpMessageContent(MessageEvent e) {
		String requestContent = null;
		HttpRequest request = (HttpRequest) e.getMessage();
		ChannelBuffer content = request.getContent();
        if (content.readable()) {
        	requestContent = content.toString(CharsetUtil.UTF_8);
        	log.debug("InstrumentationMenu: \n" + requestContent);
        }
		return requestContent;
	}
    
    public void writeContentsToBuffer(ChannelHandlerContext ctx, String responseText) {
		HttpResponse response = new DefaultHttpResponse(HTTP_1_1, OK);
        response.setHeader(CONTENT_TYPE, "text/json; charset=UTF-8");
        response.setContent(ChannelBuffers.copiedBuffer(responseText + "\r\n", CharsetUtil.UTF_8));
        
        // Close the connection as soon as the error message is sent.
        ctx.getChannel().write(response).addListener(ChannelFutureListener.CLOSE);
	}
    
    public void write401ToBuffer(ChannelHandlerContext ctx) {
    	HttpResponse response = new DefaultHttpResponse(HTTP_1_1, NOT_FOUND);
    	ctx.getChannel().write(response).addListener(ChannelFutureListener.CLOSE);
    }
}
