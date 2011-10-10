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
import org.eurekaj.api.datatypes.LiveStatistics;
import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.api.enumtypes.ValueType;
import org.eurekaj.manager.datatypes.ManagerLiveStatistics;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.json.ParseJsonObjects;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/18/11
 * Time: 10:44 PM
 * To change this template use File | Settings | File Templates.
 */
public class LiveStatisticsServlet extends EurekaJGenericServlet {
	private static final Logger log = Logger.getLogger(LiveStatisticsServlet.class);
	
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String jsonResponse = "";

        try {
            JSONObject jsonObject = BuildJsonObjectsUtil.extractRequestJSONContents(request);
            log.debug("Accepted JSON: \n" + jsonObject);

            if (jsonObject.has("storeLiveStatistics") && org.eurekaj.manager.security.SecurityManager.isAuthenticatedAsAdmin()) {
                JSONArray statList = jsonObject.getJSONArray("storeLiveStatistics");
                for (int index = 0; index < statList.length(); index++) {
                    ManagerLiveStatistics liveStatistics = ParseJsonObjects.parseLiveStatistics(statList.getJSONObject(index));

                    String value = null;
                    if (liveStatistics.getValue() != null) {
                        value = liveStatistics.getValue().toString();
                    }
                    getBerkeleyTreeMenuService().storeIncomingStatistics(liveStatistics.getGuiPath(), liveStatistics.getTimeperiod(), value,
                            ValueType.fromValue(liveStatistics.getValueType()), UnitType.fromValue(liveStatistics.getUnitType()));
                }
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

    }
}
