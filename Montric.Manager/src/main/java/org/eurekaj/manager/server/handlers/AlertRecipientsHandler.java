package org.eurekaj.manager.server.handlers;

import java.util.List;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.AlertRecipient;
import org.eurekaj.api.datatypes.Session;
import org.eurekaj.api.datatypes.User;
import org.eurekaj.api.datatypes.basic.BasicAlertRecipient;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

public class AlertRecipientsHandler extends EurekaJGenericChannelHandler {
	private Logger logger = Logger.getLogger(AlertRecipientsHandler.class.getName());

	@Override
	public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
		String jsonResponse = "";
		String cookieUuidToken = getCookieValue(e, "uuidToken");
		logger.info("cookieUuidToken: " + cookieUuidToken);
		User loggedInUser = getLoggedInUser(cookieUuidToken);
		String messageContent = getHttpMessageContent(e);

		logger.info(messageContent);

		if (isGet(e) && isAdmin(loggedInUser)) { // Get account for current user
			List<AlertRecipient> alertRecipientList = getAdministrationService().getAlertRecipients(loggedInUser.getAccountName());
			JsonArray alertArray = new JsonArray();
			for (AlertRecipient ar : alertRecipientList) {
				alertArray.add(new Gson().toJsonTree(ar, BasicAlertRecipient.class));
			}
			
			JsonObject alertPlugins = new JsonObject();
			alertPlugins.add("alert_recipients", alertArray);

			jsonResponse = alertPlugins.toString();
		} else if ((isPost(e) || isPut(e)) && isAdmin(loggedInUser)) {
			BasicAlertRecipient alertRecipient = new Gson().fromJson(messageContent, BasicAlertRecipient.class);
			alertRecipient.setAccountName(loggedInUser.getAccountName());
			getAdministrationService().persistAlertRecipient(alertRecipient);
			
			jsonResponse = new Gson().toJson(alertRecipient);
		} else if (isDelete(e) && isAdmin(loggedInUser)) {
			String id = getUrlId(e, "alert_recipients");
			getAdministrationService().deleteAlertRecipient(loggedInUser.getAccountName(), id);
			
			logger.info("Deleting Alert Recipient with id: " + id + " for account: " + loggedInUser.getAccountName());
			jsonResponse = "{\"deleted\": true}";
		}
		
		logger.info("jsonResponse: " + jsonResponse);
		writeContentsToBuffer(ctx, jsonResponse, "text/json");
	}
}
