package org.eurekaj.manager.servlets;

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

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String jsonResponse = "";

        try {
            JSONObject jsonObject = BuildJsonObjectsUtil.extractRequestJSONContents(request);
            System.out.println("Accepted JSON: \n" + jsonObject);

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
