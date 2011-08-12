package org.eurekaj.manager.servlets;

import org.eurekaj.api.datatypes.LiveStatistics;
import org.eurekaj.api.datatypes.TreeMenuNode;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.security.*;
import org.json.JSONException;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collections;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 7/9/11
 * Time: 10:43 AM
 * To change this template use File | Settings | File Templates.
 */
public class InstrumentationTableServlet extends ChartServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String jsonResponse = "";

        try {
            JSONObject jsonObject = BuildJsonObjectsUtil.extractRequestJSONContents(request);
            if (jsonObject.has("getInstrumentationTableData") && org.eurekaj.manager.security.SecurityManager.isAuthenticatedAsUser()) {
                JSONObject keyObject = jsonObject.getJSONObject("getInstrumentationTableData");
                String pathFromClient = keyObject.getString("path");
                Double averageSum = 0.0d;
                String startsWith = null;
                String endsWith = null;

                String[] pathParts = pathFromClient.split(";");
                if (pathParts.length == 2) {
                    startsWith = pathParts[0];
                    endsWith = pathParts[1];

                    int chartTimespan = getChartTimeSpan(keyObject);

                    Long fromPeriod = getFromPeriod(chartTimespan, keyObject);
                    Long toPeriod = getToPeriod(keyObject);

                    int numNodesFound = 0;

                    for (TreeMenuNode treeMenuNode : getBerkeleyTreeMenuService().getTreeMenu()) {
                        if (treeMenuNode.getGuiPath().startsWith(startsWith)
                                && treeMenuNode.getGuiPath().endsWith(endsWith)) {

                            numNodesFound++;
                            Double averageNodeValue = 0.0d;
                            List<LiveStatistics> liveList = getBerkeleyTreeMenuService().getLiveStatistics(treeMenuNode.getGuiPath(), fromPeriod, toPeriod);

                            if (liveList.size() > 0) {
                                Double sumValue = 0.0d;
                                for (LiveStatistics liveStatistics : liveList) {
                                    sumValue += liveStatistics.getValue();
                                }

                                averageNodeValue = sumValue / liveList.size();
                            }

                            averageSum += averageNodeValue;
                        }
                    }

                    if (numNodesFound > 0) {
                        averageSum = averageSum / numNodesFound;
                    }

                }

                JSONObject jsonResponseObj = new JSONObject();
                jsonResponseObj.put("columnId", pathFromClient);
                jsonResponseObj.put("name", endsWith);
                jsonResponseObj.put("value", averageSum);
                jsonResponse = jsonResponseObj.toString();
            }

            PrintWriter writer = response.getWriter();
            if (jsonResponse.length() <= 2) {
                jsonResponse = "{}";
            }
            writer.write(jsonResponse);
            response.flushBuffer();

        } catch (JSONException jsonException) {
            throw new IOException("Unable to process JSON Request", jsonException);
        }
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

}
