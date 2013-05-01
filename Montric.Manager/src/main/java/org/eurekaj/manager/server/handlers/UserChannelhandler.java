/**
    EurekaJ Profiler - http://eurekaj.haagen.name
    
    Copyright (C) 2010-2011 Joachim Haagen Skeie

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
package org.eurekaj.manager.server.handlers;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.util.Hashtable;
import java.util.List;
import java.util.UUID;

import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.Session;
import org.eurekaj.api.datatypes.User;
import org.eurekaj.api.datatypes.auth.MozillaPersonaCredentials;
import org.eurekaj.api.datatypes.basic.BasicAccount;
import org.eurekaj.api.datatypes.basic.BasicSession;
import org.eurekaj.api.datatypes.basic.BasicUser;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.json.ParseJsonObjects;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 6/18/11
 * Time: 7:31 PM
 * To change this template use File | Settings | File Templates.
 */
public class UserChannelhandler extends EurekaJGenericChannelHandler {
	private static final Logger logger = Logger.getLogger(UserChannelhandler.class);
	//private Hashtable<String, BasicUser> userHash = new Hashtable<>(); 
	
	@Override
	public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
        String jsonResponse = "";
        String uri = getUri(e);
        String cookieUuidToken = getCookieValue(e, "uuidToken");
        logger.info("cookieUuidToken: " + cookieUuidToken);
        List<User> userList = null;
        
        try {
        	logger.info("Http Message Content: " + getHttpMessageContent(e));
            JSONObject jsonObject = BuildJsonObjectsUtil.extractJsonContents(getHttpMessageContent(e));

            if (isPost(e) && uri != null && uri.endsWith("/auth/login")) {
            	logger.info("isPost /auth/login");
            	String messageContent = getHttpMessageContent(e);
            	Long expiry = null;
            	String email = null;
            	Session session = getAccountService().getSession(cookieUuidToken);
            	if (session != null) {
            		logger.info("logging in via session");
            		userList = getAccountService().getUsers(session.getEmail());
            		expiry = session.getExpiry();
            		email = session.getEmail();
            	} else {
                	logger.info("Logging in via Persona.");
            		String responseContent = loginViaMozillaPersona(messageContent);
                	MozillaPersonaCredentials credentials = new Gson().fromJson(responseContent, MozillaPersonaCredentials.class);
                	expiry = credentials.getExpires();
            		email = credentials.getEmail();
                	userList = getAccountService().getUsers(credentials.getEmail());
            	}
            	
            	if (userList.isEmpty()) {
            		//No user, request registration
            		
            		BasicSession newSession = new BasicSession();
            		newSession.setUuid(UUID.randomUUID().toString());
            		newSession.setEmail(email);
            		newSession.setExpiry(expiry);
            		newSession.setAccountName("__NEW__");
            		
            		//userHash.put(newUser.getId(), newUser);
            		getAccountService().persistSession(newSession);
            		
            		jsonResponse = "{ \"uuidToken\": \"" + newSession.getUuid() + "\", \"registered\": " + "false}";
            	} else if (userList.size() == 1) {
            		//One user with one account, return correct uuid
            		User user = userList.get(0);
            		//userHash.put(user.getId(), new BasicUser(user));
            		logger.info("One User: " + new Gson().toJson(user));
            	
            		BasicSession newSession = new BasicSession();
            		newSession.setUuid(UUID.randomUUID().toString());
            		newSession.setEmail(email);
            		newSession.setExpiry(expiry);
            		newSession.setAccountName(user.getAccountName());
            		getAccountService().persistSession(newSession);
            		
            		logger.info("Persisting new Session: " + new Gson().toJson(newSession));
            		
        			jsonResponse = "{ \"uuidToken\": \"" + newSession.getUuid() + "\", \"registered\": " + "true}";
            		
            	} else if (userList.size() > 1) {
            		//One user with multiple accounts, return list of accounts
            		jsonResponse = "{\"error\": \"not_yet_implemented\"}";
            	}
            	
            } else if (isPost(e) && uri.endsWith("/auth/register") && cookieUuidToken != null) {
            	logger.info("isPost /auth/register");
            	Session session = getAccountService().getSession(cookieUuidToken);
            	if (session != null) {
            		BasicSession updatedSession = new BasicSession(session);
            		BasicUser httpUser = ParseJsonObjects.parseUser(jsonObject);
            		
            		logger.info("HTTP user: " + new Gson().toJson(httpUser));
            		
            		updatedSession.setAccountName(httpUser.getAccountName());
            		getAccountService().persistSession(updatedSession);
            		
            		logger.info("persisted new session: " + new Gson().toJson(updatedSession));
            		
            		BasicUser newUser = new BasicUser(httpUser);
            		newUser.setUserRole("admin");
            		newUser.setUserName(session.getEmail());
            		getAccountService().persistUser(newUser);
            		
            		logger.info("persisted user: " + new Gson().toJson(newUser));
            		
            		BasicAccount newAccount = new BasicAccount();
            		newAccount.setAccountName(httpUser.getAccountName());
            		newAccount.setAccountType("new");
            		
            		getAccountService().persistAccount(newAccount);
            		
            		jsonResponse = "{ \"registered\": " + "true, \"uuidToken\": \"" + updatedSession.getUuid() + "\"}";
            	} else {
            		jsonResponse = "{ \"registered\": " + "false}";
            	}
            	
            	logger.info(jsonObject);
            } else if (isGet(e) && cookieUuidToken != null) {
            	logger.info("isGet: " + cookieUuidToken);
            	Session cookieSession = getAccountService().getSession(cookieUuidToken);
            	logger.info("cookieSession: " + new Gson().toJson(cookieSession));
            	if (cookieSession != null && cookieSession.getEmail() != null) {
            		User sessionUser = getAccountService().getUser(cookieSession.getEmail(), cookieSession.getAccountName());
            		logger.info("sessionUser: " + new Gson().toJson(sessionUser));
            		if (sessionUser != null) {
            			jsonResponse = "{\"user\": " + new Gson().toJson(sessionUser) + "}";
                		logger.info("Returning user: " + jsonResponse);
            		} else {
            			logger.info("User not Authenticated!");
                		jsonResponse = "{\"error\": \"user_not_authenticated\"}";
            		}
            	} else {
            		logger.info("User not Authenticated!");
            		jsonResponse = "{\"error\": \"user_not_authenticated\"}";
            	}
            }
        } catch (JSONException jsonException) {
            throw new IOException("Unable to process JSON Request", jsonException);
        }

        logger.info("jsonResponse: " + jsonResponse);
        writeContentsToBuffer(ctx, jsonResponse);
    }
	
	private BasicUser getUnregisteredUserWith(String username) {
		BasicUser user = null;
		
		List<User> userList = getAccountService().getUsers(username);
		
		for (User storedUser : userList) {
			if (storedUser.getUserRole() == "unregistered") {
				user = new BasicUser(storedUser);
			}
		}
		
		return user;
	}
	
	private String loginViaMozillaPersona(String messageContent) throws UnsupportedEncodingException,
			IOException, ClientProtocolException {
		
		JsonObject assertionJson = new JsonObject();
		if (messageContent.startsWith("assertion=")) {
			messageContent = messageContent.substring(10, messageContent.length());
		}
		assertionJson.addProperty("assertion", messageContent);
		assertionJson.addProperty("audience", "http://localhost:8081");
		
		int statusCode = -1;
		DefaultHttpClient httpclient = new DefaultHttpClient();
		
		HttpPost httpPost = new HttpPost("https://verifier.login.persona.org/verify");
		System.out.println(assertionJson.toString());
		StringEntity requestEntity = new StringEntity(assertionJson.toString(), "UTF-8");
		//requestEntity.setContentType("application/x-www-form-urlencoded");
		requestEntity.setContentType("application/json");

		httpPost.setEntity(requestEntity);
		HttpResponse response = httpclient.execute(httpPost);
		statusCode = response.getStatusLine().getStatusCode();

		BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
		
		String responseContent = "";
		String line = "";
		while ((line = rd.readLine()) != null) {
		  responseContent = line + "\n";
		}
		return responseContent;
	}
}
