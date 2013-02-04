package org.eurekaj.manager.server.handlers;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.Account;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.json.ParseJsonObjects;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
import org.json.JSONObject;

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

        if (isPost(e)) {
            String messageContent = getHttpMessageContent(e);
            JSONObject jsonObject = BuildJsonObjectsUtil.extractJsonContents(getHttpMessageContent(e));

            Account account = ParseJsonObjects.parseAccount(jsonObject);
            logger.info("Account Name: " + account.getAccountName());
            logger.info("Account Type: " + account.getAccountType());

            getAccountService().persistAccount(account);
        } else {
            write401ToBuffer(ctx);
        }

        List<Account> accountList = getAccountService().getAccounts();
        for (Account acc : accountList) {
            logger.info("Account Name: " + acc.getAccountName() + " Account Type: " + acc.getAccountType());
        }

        writeContentsToBuffer(ctx, jsonResponse);
    }
}
