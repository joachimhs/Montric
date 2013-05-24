package org.eurekaj.manager.server.handlers;

import java.util.List;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.User;
import org.eurekaj.manager.plugin.ManagerAlertPluginService;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

public class AlertPluginsHandler  extends EurekaJGenericChannelHandler {
	private Logger logger = Logger.getLogger(AlertPluginsHandler.class.getName());

	@Override
	public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
		String jsonResponse = "";
		String cookieUuidToken = getCookieValue(e, "uuidToken");
		logger.info("cookieUuidToken: " + cookieUuidToken);
		User loggedInUser = getLoggedInUser(cookieUuidToken);
		String messageContent = getHttpMessageContent(e);

		logger.info(messageContent);

		if (isGet(e) && isAdmin(loggedInUser)) { // Get account for current user
			List<String> alertPluginList = ManagerAlertPluginService.getInstance().getLoadedAlertPlugins();

			JsonObject alertPlugins = new JsonObject();
			JsonArray alertArray = new JsonArray();
			for (String alertPlugin : alertPluginList) {
				JsonObject pluginObject = new JsonObject();
				pluginObject.addProperty("id", alertPlugin);
				alertArray.add(pluginObject);
			}

			alertPlugins.add("alert_plugins", alertArray);
			jsonResponse = alertPlugins.toString();
		}
		
		logger.info("jsonResponse: " + jsonResponse);
		writeContentsToBuffer(ctx, jsonResponse, "text/json");
	}
}