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
import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.datatypes.GroupedStatistics;
import org.eurekaj.api.datatypes.LiveStatistics;
import org.eurekaj.api.datatypes.TreeMenuNode;
import org.eurekaj.api.enumtypes.AlertStatus;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.json.ParseJsonObjects;
import org.eurekaj.manager.security.SecurityManager;
import org.eurekaj.manager.util.ChartUtil;
import org.jsflot.xydata.XYDataList;
import org.jsflot.xydata.XYDataSetCollection;
import org.json.JSONException;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 1/20/11
 * Time: 9:14 AM
 * To change this template use File | Settings | File Templates.
 */
public class ChartServlet extends EurekaJGenericServlet {
	private static final Logger log = Logger.getLogger(ChartServlet.class);
	
    protected int getChartTimeSpan(JSONObject jsonRequest) throws JSONException {
        int chartTimespan = 10;
        if (jsonRequest.has("chartTimespan")) {
            chartTimespan = jsonRequest.getInt("chartTimespan");
        }

        return chartTimespan;
    }

    protected int getChartResolution(JSONObject jsonRequest) throws JSONException {
        int chartResolution = 15;
        if (jsonRequest.has("chartResolution")) {
            chartResolution = jsonRequest.getInt("chartResolution");
        }
        return chartResolution;
    }

    private boolean isAlertChart(JSONObject jsonRequest) throws JSONException {
        return jsonRequest.has("path") && jsonRequest.getString("path").startsWith("_alert_:");
    }

    private boolean isGroupedStatisticsChart(JSONObject jsonRequest) throws JSONException {
        return jsonRequest.has("path") && jsonRequest.getString("path").startsWith("_gs_:");
    }

    protected Long getFromPeriod(int chartTimespan, JSONObject jsonRequest) {
        Long chartFromMs = ParseJsonObjects.parseLongFromJson(jsonRequest, "chartFrom");
        Long fromPeriod = null;

        if (chartFromMs == null) {
            Calendar thenCal = Calendar.getInstance();
            thenCal.add(Calendar.MINUTE, chartTimespan * -1);

            fromPeriod = thenCal.getTime().getTime() / 15000;
        } else {
            fromPeriod = chartFromMs / 15000;
        }

        return fromPeriod;
    }

    protected Long getToPeriod(JSONObject jsonRequest) {
        Long chartToMs = ParseJsonObjects.parseLongFromJson(jsonRequest, "chartTo");
        Long toPeriod = null;

        if (chartToMs == null) {
            Calendar nowCal = Calendar.getInstance();
            toPeriod = nowCal.getTime().getTime() / 15000;
        } else {
            toPeriod = chartToMs / 15000;
        }

        return toPeriod;
    }

    protected Long getChartOffset(JSONObject jsonRequest) throws JSONException {
        long chartOffset = 0;
        if (jsonRequest.has("chartOffsetMs")) {
            chartOffset = jsonRequest.getLong("chartOffsetMs");
        }

        return chartOffset;
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String jsonResponse = "";

        try {
            JSONObject jsonObject = BuildJsonObjectsUtil.extractRequestJSONContents(request);
            log.debug("Accepted JSON: \n" + jsonObject);
            
            if (jsonObject.has("getInstrumentationChartData") && SecurityManager.isAuthenticatedAsUser()) {
                JSONObject keyObject = jsonObject.getJSONObject("getInstrumentationChartData");
                String chartId = keyObject.getString("id");
                String pathFromClient = keyObject.getString("path");
                String chartPath = null;

                int chartTimespan = getChartTimeSpan(keyObject);
                int chartResolution = getChartResolution(keyObject);
                long chartoffset = getChartOffset(keyObject);

                Long fromPeriod = getFromPeriod(chartTimespan, keyObject);
                Long toPeriod = getToPeriod(keyObject);

                List<LiveStatistics> liveList = null;
                String seriesLabel = null;
                Alert alert = null;
                GroupedStatistics groupedStatistics = null;
                XYDataSetCollection valueCollection = new XYDataSetCollection();

                //TODO: This if-else code block needs refactoring. Its not DRY
                if (isAlertChart(keyObject)) {
                    String alertName = pathFromClient.substring(8, pathFromClient.length());
                    alert = getBerkeleyTreeMenuService().getAlert(alertName);
                    if (alert != null) {
                        chartPath = alert.getGuiPath();
                        seriesLabel = "Alert: " + alert.getAlertName();
                    }

                    liveList = getBerkeleyTreeMenuService().getLiveStatistics(chartPath, fromPeriod, toPeriod);
                    Collections.sort(liveList);
                    valueCollection = ChartUtil.generateChart(liveList, seriesLabel, fromPeriod * 15000, toPeriod * 15000, chartResolution);
                    valueCollection.addDataList(ChartUtil.buildWarningList(alert, AlertStatus.CRITICAL, fromPeriod * 15000, toPeriod * 15000));
                    valueCollection.addDataList(ChartUtil.buildWarningList(alert, AlertStatus.WARNING, fromPeriod * 15000, toPeriod * 15000));
                } else if (isGroupedStatisticsChart(keyObject)) {
                    chartPath = pathFromClient;
                    String groupName = pathFromClient.substring(5, pathFromClient.length());
                    groupedStatistics = getBerkeleyTreeMenuService().getGroupedStatistics(groupName);
                    if (groupedStatistics != null) {
                        seriesLabel = "Grouped Statistics: " + groupedStatistics.getName();
                        for (String gsPath : groupedStatistics.getGroupedPathList()) {
                            liveList = getBerkeleyTreeMenuService().getLiveStatistics(gsPath, fromPeriod, toPeriod);
                            Collections.sort(liveList);
                            for (XYDataList dataList : ChartUtil.generateChart(liveList, gsPath, fromPeriod * 15000, toPeriod * 15000, chartResolution).getDataList()) {
                                valueCollection.addDataList(dataList);
                            }
                        }
                    }
                } else {
                    chartPath = pathFromClient;
                    seriesLabel = chartPath;
                    liveList = getBerkeleyTreeMenuService().getLiveStatistics(chartPath, fromPeriod, toPeriod);
                    Collections.sort(liveList);
                    valueCollection = ChartUtil.generateChart(liveList, seriesLabel, fromPeriod * 15000, toPeriod * 15000, chartResolution);
                }

                TreeMenuNode treeMenuNode = getBerkeleyTreeMenuService().getTreeMenu(chartPath);
                if (treeMenuNode != null || isGroupedStatisticsChart(keyObject)) {
                    jsonResponse = BuildJsonObjectsUtil.generateChartData(seriesLabel, chartPath, valueCollection, chartoffset);
                } else {
                    jsonResponse = "{\"instrumentationNode\": \"" + seriesLabel + "\", \"table\": " + BuildJsonObjectsUtil.generateArrayOfEndNodesStartingWith(getBerkeleyTreeMenuService().getTreeMenu(), seriesLabel) + ", \"chart\": null}";
                }

                log.debug("Got Chart Data:\n" + jsonResponse);
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
