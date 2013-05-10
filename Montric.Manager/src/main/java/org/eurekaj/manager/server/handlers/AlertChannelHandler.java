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

import java.io.IOException;
import java.util.Calendar;
import java.util.List;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.datatypes.TriggeredAlert;
import org.eurekaj.api.datatypes.User;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.json.ParseJsonObjects;
import org.eurekaj.manager.plugin.ManagerAlertPluginService;
import org.eurekaj.manager.util.UriUtil;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.handler.codec.http.HttpRequest;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 1/20/11
 * Time: 9:15 AM
 * To change this template use File | Settings | File Templates.
 */
public class AlertChannelHandler extends EurekaJGenericChannelHandler {
	private static final Logger log = Logger.getLogger(AlertChannelHandler.class);
	
	@Override
	public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
		
        String jsonResponse = "";
        String cookieUuidToken = getCookieValue(e, "uuidToken");
        User loggedInUser = getLoggedInUser(cookieUuidToken);
        try {
            HttpRequest request = (HttpRequest)e.getMessage();
            JSONObject jsonObject = BuildJsonObjectsUtil.extractJsonContents(getHttpMessageContent(e));

            String id = getUrlId(e, "alert_models");

            log.info("Got: " + jsonObject.toString());
            if (isAdmin(loggedInUser) && jsonObject.has("getAlertPlugins")) {
                jsonResponse = BuildJsonObjectsUtil.generateAlertPluginsJson(ManagerAlertPluginService.getInstance().getLoadedAlertPlugins());
                log.debug("Got Alert Plugins:\n" + jsonResponse);
            } else if (isAdmin(loggedInUser) && (isPut(e) || isPost(e))) {
                Alert parsedAlert = ParseJsonObjects.parseAlertJson(jsonObject, id, loggedInUser.getAccountName());
                if (parsedAlert != null && parsedAlert.getAlertName() != null && parsedAlert.getAlertName().length() > 0) {
                    getBerkeleyTreeMenuService().persistAlert(parsedAlert);
                }
                JSONObject alertTopObject = new JSONObject();
                alertTopObject.put("alert_model", BuildJsonObjectsUtil.generateAlertJSON(parsedAlert));

                jsonResponse = alertTopObject.toString();
            } else if (isUser(loggedInUser) && jsonObject.has("getTriggeredAlerts")) {
                Long toTimePeriod = Calendar.getInstance().getTimeInMillis() / 15000;
                Long fromTimePeriod = toTimePeriod - (4 * 60);
                List<TriggeredAlert> triggeredAlertList = getBerkeleyTreeMenuService().getTriggeredAlerts(loggedInUser.getAccountName(), fromTimePeriod, toTimePeriod);
                jsonResponse = BuildJsonObjectsUtil.generateTriggeredAlertsJson(triggeredAlertList);
                log.debug("Got Triggered Alerts:\n" + jsonResponse);
            } else if (isAdmin(loggedInUser) && isDelete(e) && id != null) {
                getBerkeleyTreeMenuService().deleteAlert(id, loggedInUser.getAccountName());
                log.debug("Successfully deleted Alert with name:\n" + id);
            } else if(isUser(loggedInUser)){
            	jsonResponse = BuildJsonObjectsUtil.generateAlertsJson(getBerkeleyTreeMenuService().getAlerts(loggedInUser.getAccountName()));
                log.debug("Got Alerts:\n" + jsonResponse);
            }
            
            if (jsonResponse.length() == 0 && isGet(e)) {
            	jsonResponse = "{}";
            }

        } catch (JSONException jsonException) {
            throw new IOException("Unable to process JSON Request", jsonException);
        }

        writeContentsToBuffer(ctx, jsonResponse);
    }
}
