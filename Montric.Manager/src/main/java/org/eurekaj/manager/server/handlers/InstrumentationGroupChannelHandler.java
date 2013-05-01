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

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.GroupedStatistics;
import org.eurekaj.api.datatypes.User;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.json.ParseJsonObjects;
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
 * Time: 9:16 AM
 * To change this template use File | Settings | File Templates.
 */
public class InstrumentationGroupChannelHandler extends EurekaJGenericChannelHandler {
	private static final Logger log = Logger.getLogger(InstrumentationGroupChannelHandler.class);
	
	@Override
	public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
		String jsonResponse = "";
		String cookieUuidToken = getCookieValue(e, "uuidToken");
        User loggedInUser = getLoggedInUser(cookieUuidToken);

        try {
            JSONObject jsonObject = BuildJsonObjectsUtil.extractJsonContents(getHttpMessageContent(e));
            HttpRequest request = (HttpRequest)e.getMessage();
            String uri = request.getUri();
            String id = UriUtil.getIdFromUri(uri, "chart_group_models");

            if (id != null) {
                id = id.replaceAll("\\%20", " ");
            }

            log.info("got chartGroup JSON" + jsonObject.toString());
            
            if (isAdmin(loggedInUser) && (isPut(e) || isPost(e))) {
            	GroupedStatistics groupedStatistics = ParseJsonObjects.parseInstrumentationGroup(jsonObject, id, loggedInUser.getAccountName());
                if (groupedStatistics != null && groupedStatistics.getName() != null && groupedStatistics.getName().length() > 0) {
                    getBerkeleyTreeMenuService().persistGroupInstrumentation(groupedStatistics);
                }
                JSONObject topObject = new JSONObject();
                topObject.put("chart_group_model", BuildJsonObjectsUtil.generateChartGroupJson(groupedStatistics));
                jsonResponse = topObject.toString();
            } else if (isAdmin(loggedInUser) && isGet(e)) {
                JSONObject topObject = new JSONObject();
                topObject.put("chart_group_models", BuildJsonObjectsUtil.generateInstrumentationGroupsJson(getBerkeleyTreeMenuService().getGroupedStatistics(loggedInUser.getAccountName())));

            	jsonResponse = topObject.toString();
                log.debug("Got InstrumentationGroups:\n" + jsonResponse);
            } else if (isAdmin(loggedInUser) && isDelete(e) && id != null) {
                getBerkeleyTreeMenuService().deleteChartGroup(id, loggedInUser.getAccountName());
            }

        } catch (JSONException jsonException) {
            throw new IOException("Unable to process JSON Request", jsonException);
        }

        log.info("Returning JSON from chartGroupHandler: '" + jsonResponse + "'");
        writeContentsToBuffer(ctx, jsonResponse);
	}
}
