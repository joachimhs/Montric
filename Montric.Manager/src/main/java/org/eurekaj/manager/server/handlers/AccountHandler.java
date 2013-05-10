package org.eurekaj.manager.server.handlers;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.Account;
import org.eurekaj.api.datatypes.Session;
import org.eurekaj.api.datatypes.User;
import org.eurekaj.api.datatypes.basic.BasicAccount;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.json.ParseJsonObjects;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
import org.json.JSONObject;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: joahaa
 * Date: 2/4/13
 * Time: 4:05 PM
 * To change this template use File | Settings | File Templates.
 */
public class AccountHandler  extends EurekaJGenericChannelHandler {
    private Logger logger = Logger.getLogger(AccountHandler.class.getName());

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
        
        if ((isPost(e) || isPut(e)) && isRoot(session)) {
            //Update the account
            BasicAccount account = new Gson().fromJson(messageContent, BasicAccount.class);
            logger.info("Account Name: " + account.getId());
            logger.info("Account Type: " + account.getAccountType());

            getAccountService().persistAccount(account);
        } else if (isPost(e) && session != null) { //Register new account
        	//TODO: Verify that account name is unique!!
        	JSONObject jsonObject = BuildJsonObjectsUtil.extractJsonContents(getHttpMessageContent(e));

            Account account = ParseJsonObjects.parseAccount(jsonObject);
            logger.info("Account Name: " + account.getId());
            BasicAccount basicAccount = new BasicAccount(account);
            basicAccount.setAccountType("new");

            getAccountService().persistAccount(account);
        } else if(isGet(e) && id != null && session != null) { //Get account for current user
        	logger.info("Getting account for: " + session.getAccountName());
        	Account account = getAccountService().getAccount(session.getAccountName());
        	JsonObject accountObject = new JsonObject();
        	accountObject.add("account", new Gson().toJsonTree(account));
        	
        	jsonResponse = accountObject.toString();
        } else if (isGet(e) && isRoot(session)) {
            logger.info("Getting Accounts");
            List<Account> accountList = getAccountService().getAccounts();
            JsonArray accountArray = new JsonArray();
            for (Account account : accountList) {
            	accountArray.add(new Gson().toJsonTree(account));
            }
            JsonObject accountsObject = new JsonObject();
            accountsObject.add("accounts", accountArray);
            
            jsonResponse = accountsObject.toString(); 
        } else {
        	write401ToBuffer(ctx);
        }

        logger.info("jsonResponse: " + jsonResponse);
        writeContentsToBuffer(ctx, jsonResponse);
    }
}
