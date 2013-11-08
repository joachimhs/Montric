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
import java.net.URLDecoder;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.Statistics;
import org.eurekaj.api.datatypes.User;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.util.UriUtil;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.handler.codec.http.HttpRequest;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

public class MainMenuChannelHandler extends EurekaJGenericChannelHandler {
	private static final Logger log = Logger.getLogger(MainMenuChannelHandler.class);
	
	@Override
	public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
		log.info("MainMenuChannelHandler");
		String jsonResponse = "";
		String cookieUuidToken = getCookieValue(e, "uuidToken");
		User loggedInUser = null;
		if (cookieUuidToken != null) {
			loggedInUser = getLoggedInUser(cookieUuidToken);
		} 
        JSONObject jsonObject = BuildJsonObjectsUtil.extractJsonContents(getHttpMessageContent(e));
        String accountName = getAccountForAccessToken(jsonObject);
        
        try {        	
            HttpRequest request = (HttpRequest)e.getMessage();
            String uri = request.getUri();

            String objectArrayName = "mainMenus";
            if (uri.contains("adminMenus")) {
                objectArrayName = "adminMenus";
            }

            String id = UriUtil.getIdFromUri(uri, objectArrayName);

            if (id != null) {
                id = id.replaceAll("\\%20", " ");
            }
            log.debug("Accepted JSON: \n" + jsonObject);

            if (isAdmin(loggedInUser) && isDelete(e) && id != null) {
            	getBerkeleyTreeMenuService().deleteTreeMenuNode(id, loggedInUser.getAccountName());
            	
            	log.info("Deleting Main Menu Item with id: " + id);
            	
            } else if (isUser(loggedInUser) || accountName != null) {
            	String loggedInAccountName = accountName;
            	if (accountName == null) {
            		loggedInAccountName = loggedInUser.getAccountName();
            	}
            	
            	String decoded = "{}";
            	if (uri.contains("?") && uri.contains("{") && uri.contains("}")) {
            		decoded = URLDecoder.decode(uri.substring(uri.lastIndexOf('?')+1, uri.length()), "UTF-8");
            	}
            	log.info("Decoded: " + decoded);
            	
            	
                JSONObject keyObject = new JSONObject(new JSONTokener(decoded));
                
                String filterChartType = null;
                if (uri.contains("adminMenu")) {
                	filterChartType = "chart";
                }

                JSONArray menuItems = BuildJsonObjectsUtil.buildTreeTypeMenuJsonObject("menuID",
                        getBerkeleyTreeMenuService().getTreeMenu(loggedInAccountName),
                        getBerkeleyTreeMenuService().getAlerts(loggedInAccountName),
                        getBerkeleyTreeMenuService().getGroupedStatistics(loggedInAccountName),
                        0, 15, true, filterChartType);

                JSONObject menuItemsObj = new JSONObject();
                menuItemsObj.put(objectArrayName, menuItems);
                
            	jsonResponse = menuItemsObj.toString();
            }

        } catch (JSONException jsonException) {
            throw new IOException("Unable to process JSON Request", jsonException);
        }

        if (jsonResponse.length() <= 2) {
            jsonResponse = "{\"mainMenus\": []}";
        }
        writeContentsToBuffer(ctx, jsonResponse, "text/json");
	}
	
	
    /*{
        "id": "Alerts",
        "name": "Alerts",
        "nodeType": "parent",
        "parentPath": null,
        "children": ["Alerts:EurekaJ Heap", "Alerts:JSFlot Heap"]
    }]";*/
	
	
	private String buildInstrumentationMenuNode(String jsonResponse, JSONObject jsonObject, String accountName) throws JSONException {
		if (jsonObject.has("getInstrumentationMenuNode")) {
		    String nodeId = jsonObject.getString("getInstrumentationMenuNode");
		    Statistics node = getBerkeleyTreeMenuService().getTreeMenu(nodeId, accountName);
		    jsonResponse = BuildJsonObjectsUtil.buildInstrumentationNode(node).toString();
		    log.debug("Got Node: \n" + jsonResponse);
		}
		return jsonResponse;
	}

	private String buildInstrumentationMenu(String jsonResponse, JSONObject jsonObject, String accountName) throws JSONException {
		if (jsonObject.has("getInstrumentationMenu")) {
		    String menuId = jsonObject.getString("getInstrumentationMenu");
		    boolean includeCharts = jsonObject.has("includeCharts") && jsonObject.getBoolean("includeCharts");

		    String includeChartType = null;
		    if (jsonObject.has("nodeType")) {
		        includeChartType = jsonObject.getString("nodeType");
		    }
		    jsonResponse = BuildJsonObjectsUtil.buildTreeTypeMenuJsonObject(menuId,
		            getBerkeleyTreeMenuService().getTreeMenu(accountName),
		            getBerkeleyTreeMenuService().getAlerts(accountName),
		            getBerkeleyTreeMenuService().getGroupedStatistics(accountName),
		            0, 15, includeCharts, includeChartType).toString();

		    log.debug("Got Tree Type Menu:\n" + jsonResponse);
		}
		return jsonResponse;
	}

	private void deleteInstrumentationMenuNode(JSONObject jsonObject, String accountName) throws JSONException {
		if (jsonObject.has("deleteInstrumentationMenuNodes")) {
			JSONArray nodes = jsonObject.getJSONArray("deleteInstrumentationMenuNodes");
			for (int i = 0; i < nodes.length(); i++) {
				String guiPath = nodes.getString(i);
				getBerkeleyTreeMenuService().deleteTreeMenuNode(guiPath, accountName);
			}
			
		}
	}
}
