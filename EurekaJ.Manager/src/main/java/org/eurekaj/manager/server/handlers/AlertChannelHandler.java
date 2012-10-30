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
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.json.ParseJsonObjects;
import org.eurekaj.manager.plugin.ManagerAlertPluginService;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
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

        try {
            JSONObject jsonObject = BuildJsonObjectsUtil.extractJsonContents(getHttpMessageContent(e));

            if (jsonObject.has("getAlertPlugins")) {
                jsonResponse = BuildJsonObjectsUtil.generateAlertPluginsJson(ManagerAlertPluginService.getInstance().getLoadedAlertPlugins());
                log.debug("Got Alert Plugins:\n" + jsonResponse);
            } else if (isPut(e) || isPost(e)) {
                Alert parsedAlert = ParseJsonObjects.parseAlertJson(jsonObject);
                if (parsedAlert != null && parsedAlert.getAlertName() != null && parsedAlert.getAlertName().length() > 0) {
                    getBerkeleyTreeMenuService().persistAlert(parsedAlert);
                }    
                jsonResponse = BuildJsonObjectsUtil.generateAlertJSON(parsedAlert).toString();
            } else if (jsonObject.has("getTriggeredAlerts")) {
                Long toTimePeriod = Calendar.getInstance().getTimeInMillis() / 15000;
                Long fromTimePeriod = toTimePeriod - (4 * 60);
                List<TriggeredAlert> triggeredAlertList = getBerkeleyTreeMenuService().getTriggeredAlerts(fromTimePeriod, toTimePeriod);
                jsonResponse = BuildJsonObjectsUtil.generateTriggeredAlertsJson(triggeredAlertList);
                log.debug("Got Triggered Alerts:\n" + jsonResponse);
            } else if (isDelete(e)) {
                String alertName = jsonObject.getString("id");
                getBerkeleyTreeMenuService().deleteAlert(alertName);
                log.debug("Successfully deleted Alert with name:\n" + alertName);
            } else {
            	jsonResponse = BuildJsonObjectsUtil.generateAlertsJson(getBerkeleyTreeMenuService().getAlerts());
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
