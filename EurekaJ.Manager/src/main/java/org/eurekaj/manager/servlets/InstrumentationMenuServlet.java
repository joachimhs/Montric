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
package org.eurekaj.manager.servlets;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.TreeMenuNode;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.security.SecurityManager;
import org.json.JSONException;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

public class InstrumentationMenuServlet extends EurekaJGenericServlet {
	private static final Logger log = Logger.getLogger(InstrumentationMenuServlet.class);
	
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String jsonResponse = "";

        try {
            JSONObject jsonObject = BuildJsonObjectsUtil.extractRequestJSONContents(request);
            log.debug("Accepted JSON: \n" + jsonObject);

            if (jsonObject.has("getInstrumentationMenu") && SecurityManager.isAuthenticatedAsUser()) {
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

            if (jsonObject.has("getInstrumentationMenuNode") && SecurityManager.isAuthenticatedAsUser()) {
                String nodeId = jsonObject.getString("getInstrumentationMenuNode");
                TreeMenuNode node = getBerkeleyTreeMenuService().getTreeMenu(nodeId);
                jsonResponse = BuildJsonObjectsUtil.buildInstrumentationNode(node).toString();
                log.debug("Got Node: \n" + jsonResponse);
            }

        } catch (JSONException jsonException) {
            throw new IOException("Unable to process JSON Request", jsonException);
        }

        PrintWriter writer = response.getWriter();
        if (jsonResponse.length() <= 2) {
            jsonResponse = "{}";
        }
        writer.write(jsonResponse);
        response.flushBuffer();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    	String jsonResponse = "";
    	
    	try {
	    	if (SecurityManager.isAuthenticatedAsUser()) {
	    		jsonResponse = BuildJsonObjectsUtil.buildTreeTypeMenuJsonObject("instrumentationMenu",
	                    getBerkeleyTreeMenuService().getTreeMenu(),
	                    getBerkeleyTreeMenuService().getAlerts(),
	                    getBerkeleyTreeMenuService().getGroupedStatistics(),
	                    0, 15, true, null).toString();
	    	}
    	} catch (JSONException jsonException) {
            throw new IOException("Unable to process JSON Request", jsonException);
        }
    	
    	PrintWriter writer = response.getWriter();
        if (jsonResponse.length() <= 2) {
            jsonResponse = "{}";
        }
        writer.write(jsonResponse);
        response.flushBuffer();
    }
}
