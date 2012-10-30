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
import org.eurekaj.api.datatypes.TreeMenuNode;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
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
		String jsonResponse = "";
        
        try {        	
            JSONObject jsonObject = BuildJsonObjectsUtil.extractJsonContents(getHttpMessageContent(e));
            log.debug("Accepted JSON: \n" + jsonObject);

            if (isDelete(e) && jsonObject.has("id")) {
            	getBerkeleyTreeMenuService().deleteTreeMenuNode(jsonObject.getString("id"));
            	
            	log.info("Deleting Main Menu Item with id: " + jsonObject.getString("id"));
            	
            } else if (isGet(e)) {
            	HttpRequest request = (HttpRequest)e.getMessage();
            	String uri = request.getUri();
            	String decoded = "{}";
            	if (uri.contains("?") && uri.contains("{") && uri.contains("}")) {
            		decoded = URLDecoder.decode(uri.substring(uri.lastIndexOf('?')+1, uri.length()), "UTF-8");
            	}
            	log.info("Decoded: " + decoded);
            	
            	
                JSONObject keyObject = new JSONObject(new JSONTokener(decoded));
                
                String filterChartType = null;
                if (keyObject.has("filterChartType")) {
                	filterChartType = keyObject.getString("filterChartType");
                }
                
            	jsonResponse = BuildJsonObjectsUtil.buildTreeTypeMenuJsonObject("menuID",
    	            getBerkeleyTreeMenuService().getTreeMenu(),
    	            getBerkeleyTreeMenuService().getAlerts(),
    	            getBerkeleyTreeMenuService().getGroupedStatistics(),
    	            0, 15, true, filterChartType).toString();
            	
            	if (jsonResponse.length() <= 2) {
                    jsonResponse = "{}";
                }
            }
        } catch (JSONException jsonException) {
            throw new IOException("Unable to process JSON Request", jsonException);
        }

        writeContentsToBuffer(ctx, jsonResponse);
	}
	
	
    /*{
        "id": "Alerts",
        "name": "Alerts",
        "nodeType": "parent",
        "parentPath": null,
        "children": ["Alerts:EurekaJ Heap", "Alerts:JSFlot Heap"]
    }]";*/
	
	
	private String buildInstrumentationMenuNode(String jsonResponse, JSONObject jsonObject) throws JSONException {
		if (jsonObject.has("getInstrumentationMenuNode")) {
		    String nodeId = jsonObject.getString("getInstrumentationMenuNode");
		    TreeMenuNode node = getBerkeleyTreeMenuService().getTreeMenu(nodeId);
		    jsonResponse = BuildJsonObjectsUtil.buildInstrumentationNode(node).toString();
		    log.debug("Got Node: \n" + jsonResponse);
		}
		return jsonResponse;
	}

	private String buildInstrumentationMenu(String jsonResponse, JSONObject jsonObject) throws JSONException {
		if (jsonObject.has("getInstrumentationMenu")) {
		    String menuId = jsonObject.getString("getInstrumentationMenu");
		    boolean includeCharts = jsonObject.has("includeCharts") && jsonObject.getBoolean("includeCharts");

		    String includeChartType = null;
		    if (jsonObject.has("nodeType")) {
		        includeChartType = jsonObject.getString("nodeType");
		    }
		    jsonResponse = BuildJsonObjectsUtil.buildTreeTypeMenuJsonObject(menuId,
		            getBerkeleyTreeMenuService().getTreeMenu(),
		            getBerkeleyTreeMenuService().getAlerts(),
		            getBerkeleyTreeMenuService().getGroupedStatistics(),
		            0, 15, includeCharts, includeChartType).toString();

		    log.debug("Got Tree Type Menu:\n" + jsonResponse);
		}
		return jsonResponse;
	}

	private void deleteInstrumentationMenuNode(JSONObject jsonObject) throws JSONException {
		if (jsonObject.has("deleteInstrumentationMenuNodes")) {
			JSONArray nodes = jsonObject.getJSONArray("deleteInstrumentationMenuNodes");
			for (int i = 0; i < nodes.length(); i++) {
				String guiPath = nodes.getString(i);
				getBerkeleyTreeMenuService().deleteTreeMenuNode(guiPath);
			}
			
		}
	}
}
