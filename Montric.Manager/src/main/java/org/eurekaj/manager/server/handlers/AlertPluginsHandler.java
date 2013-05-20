package org.eurekaj.manager.server.handlers;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.Account;
import org.eurekaj.api.datatypes.Session;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

public class AlertPluginsHandler extends EurekaJGenericChannelHandler {
	private Logger logger = Logger.getLogger(AlertPluginsHandler.class.getName());

	@Override
    public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
		String jsonResponse = "";
        String uri = getUri(e);
        String cookieUuidToken = getCookieValue(e, "uuidToken");
        logger.info("cookieUuidToken: " + cookieUuidToken);
        Session session = getAccountService().getSession(cookieUuidToken);
        String id = getUrlId(e, "account");
        String messageContent = getHttpMessageContent(e);
        
        logger.info(messageContent);
        
    if(isGet(e) && session != null) { //Get account for current user
    	logger.info("Getting alert plugins for: " + session.getAccountName());
    	
    	
    	jsonResponse = "{\"alert_plugins\": [] }";
    }
        logger.info("jsonResponse: " + jsonResponse);
        writeContentsToBuffer(ctx, jsonResponse, "text/json");
	}
}
