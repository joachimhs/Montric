package org.eurekaj.manager.server.handlers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.AccessToken;
import org.eurekaj.api.datatypes.Account;
import org.eurekaj.api.datatypes.User;
import org.eurekaj.api.datatypes.basic.BasicAccessToken;
import org.eurekaj.api.datatypes.basic.BasicAccount;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

public class AccessTokenHandler extends EurekaJGenericChannelHandler {
	private Logger logger = Logger.getLogger(AccessTokenHandler.class.getName());
	
	@Override
	public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
		String jsonResponse = "";
        String uri = getUri(e);
        String cookieUuidToken = getCookieValue(e, "uuidToken");
        User loggedInUser = getLoggedInUser(cookieUuidToken);
        
        logger.info("cookieUuidToken: " + cookieUuidToken);
        
    	logger.info("Http Message Content: " + getHttpMessageContent(e));
        JSONObject jsonObject = BuildJsonObjectsUtil.extractJsonContents(getHttpMessageContent(e));
        
        if ((isPost(e) || isPut(e)) && isAdmin(loggedInUser)) {
        	BasicAccessToken newAccessToken = new Gson().fromJson(getHttpMessageContent(e), BasicAccessToken.class);
        	Account account = getAccountService().getAccount(loggedInUser.getAccountName());
        	
        	if (account != null && newAccessToken != null && newAccessToken.getId() != null && newAccessToken.getId().length() >= 16) {
        		newAccessToken.setAccountName(account.getId());
        		logger.info("Persisting AccessToken: " + new Gson().toJson(newAccessToken));
        		getAccountService().persistAccessToken(newAccessToken);
        		if (account.getAccessTokens() == null) {
        			BasicAccount newAccount = new BasicAccount(account);
        			newAccount.setAccessTokens(new ArrayList<String>());
        			account = newAccount;
        		}
        		account.getAccessTokens().add(newAccessToken.getId());
        		getAccountService().persistAccount(account);
        	}
        	
        	jsonResponse = new Gson().toJson(newAccessToken);
        } else if (isGet(e) && isAdmin(loggedInUser)) {
        	logger.info("Account Name: " + loggedInUser.getAccountName());
        	Account account = getAccountService().getAccount(loggedInUser.getAccountName());
        	logger.info("Account: " + account);
        	List<String> accessTokens = account.getAccessTokens();
        	if (accessTokens == null) {
        		accessTokens = new ArrayList<>();
        	}
        	
        	JsonArray accessTokenArray = new JsonArray();
        	for (String accessToken : accessTokens) {
        		AccessToken accessTokenObject = getAccountService().getAccessToken(accessToken);
        		if (accessTokenObject != null && accessTokenObject.getAccountName().equals(account.getId())) {
        			accessTokenArray.add(new Gson().toJsonTree(accessTokenObject));
        		}
        	}
        	
        	JsonObject accessTokensJson = new JsonObject();
        	accessTokensJson.add("access_tokens", accessTokenArray);
        	jsonResponse = accessTokensJson.toString();
        } else if (isDelete(e) && isAdmin(loggedInUser)) {
        	
        }
            	
        

        logger.info("jsonResponse: " + jsonResponse);
        writeContentsToBuffer(ctx, jsonResponse);
	}
}
