package org.eurekaj.manager.server.handlers;

import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.CONTENT_TYPE;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.OK;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.NOT_FOUND;
import static org.jboss.netty.handler.codec.http.HttpVersion.HTTP_1_1;

import java.util.Set;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.Session;
import org.eurekaj.api.datatypes.User;
import org.eurekaj.manager.service.*;
import org.eurekaj.manager.util.UriUtil;
import org.jboss.netty.buffer.ChannelBuffer;
import org.jboss.netty.buffer.ChannelBuffers;
import org.jboss.netty.channel.ChannelFutureListener;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.channel.SimpleChannelUpstreamHandler;
import org.jboss.netty.handler.codec.http.Cookie;
import org.jboss.netty.handler.codec.http.CookieDecoder;
import org.jboss.netty.handler.codec.http.DefaultHttpResponse;
import org.jboss.netty.handler.codec.http.HttpMethod;
import org.jboss.netty.handler.codec.http.HttpRequest;
import org.jboss.netty.handler.codec.http.HttpResponse;
import org.jboss.netty.util.CharsetUtil;

public class EurekaJGenericChannelHandler extends SimpleChannelUpstreamHandler {
	private static Logger logger = Logger.getLogger(EurekaJGenericChannelHandler.class.getName());
	private TreeMenuService berkeleyTreeMenuService;
    private AdministrationService administrationService;
    private AccountService accountService;
    private String rootUser;
	
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

    public AccountService getAccountService() {
        if (accountService == null) {
            accountService = new ManagerAccountService();
        }

        return accountService;
    }
    
    public String getRootUser() {
		if (rootUser == null) {
			rootUser = System.getProperty("montric.rootUser");
		}
		
		return rootUser;
	}
    
    public String getUri(MessageEvent e) {
    	HttpRequest request = (HttpRequest) e.getMessage();
        return request.getUri();
    }
    
    public String getCookieValue(MessageEvent e, String cookieName) {
    	String cookieValue = null;
    	
    	HttpRequest request = (HttpRequest) e.getMessage();
		String value = request.getHeader("Cookie");
		logger.info("cookie header: \n" + value);
		if (value != null) {
			Set<Cookie> cookies = new CookieDecoder().decode(value);
			for (Cookie cookie : cookies) {
				if (cookie.getName().equals(cookieName)) {
					cookieValue = cookie.getValue();
					break;
				}
			}
		}
    	
    	return cookieValue;
    }
    
    protected User getLoggedInUser(String cookieUuidToken) {
		User loggedInUser = null;
        Session session = getAccountService().getSession(cookieUuidToken);
        if (session != null) {
        	loggedInUser = getAccountService().getUser(session.getEmail(), session.getAccountName());
        }
        
        return loggedInUser;
	}
    
    protected boolean isUser(User user) {
    	return (user != null && (user.getUserRole().equals("user") || user.getUserRole().equals("admin"))); 
    }
    
    protected boolean isAdmin(User user) {
    	return (user != null && (user.getUserRole().equals("admin"))); 
    }
    
    protected boolean isRoot(Session session) {
    	return getRootUser() != null && session != null && session.getEmail().equals(getRootUser());
    }
    
    protected String getUrlId(MessageEvent e, String urlToken) {
    	HttpRequest request = (HttpRequest)e.getMessage();
    	String uri = request.getUri();
        String id = UriUtil.getIdFromUri(uri, urlToken);

        if (id != null) {
            id = id.replaceAll("\\%20", " ");
        }
        
        return id;
    }
    
    public boolean isPut(MessageEvent e) {
    	HttpRequest request = (HttpRequest) e.getMessage();
		HttpMethod method = request.getMethod();
		return method == HttpMethod.PUT;
    }
    
    public boolean isPost(MessageEvent e) {
    	HttpRequest request = (HttpRequest) e.getMessage();
		HttpMethod method = request.getMethod();
		return method == HttpMethod.POST;
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
        	logger.debug("InstrumentationMenu: \n" + requestContent);
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
