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
import java.util.Collections;
import java.util.List;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.datatypes.GroupedStatistics;
import org.eurekaj.api.datatypes.LiveStatistics;
import org.eurekaj.api.datatypes.Session;
import org.eurekaj.api.datatypes.Statistics;
import org.eurekaj.api.datatypes.User;
import org.eurekaj.api.datatypes.basic.BasicUser;
import org.eurekaj.api.enumtypes.AlertStatus;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.json.ParseJsonObjects;
import org.eurekaj.manager.util.ChartUtil;
import org.eurekaj.manager.util.UriUtil;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.handler.codec.http.HttpRequest;
import org.jsflot.xydata.XYDataList;
import org.jsflot.xydata.XYDataSetCollection;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 1/20/11
 * Time: 9:14 AM
 * To change this template use File | Settings | File Templates.
 */
public class ChartChannelHandler extends EurekaJGenericChannelHandler {
	private static final Logger log = Logger.getLogger(ChartChannelHandler.class);
	
    protected int getChartTimeSpan(JSONObject jsonRequest) throws JSONException {
        int chartTimespan = 10;
        if (jsonRequest.has("chartTimespan")) {
            chartTimespan = jsonRequest.getInt("chartTimespan");
        } else if (jsonRequest.has("ts")) {
            chartTimespan = jsonRequest.getInt("ts");
        }

        return chartTimespan;
    }

    protected int getChartResolution(JSONObject jsonRequest) throws JSONException {
        int chartResolution = 15;
        if (jsonRequest.has("chartResolution")) {
            chartResolution = jsonRequest.getInt("chartResolution");
        } else if (jsonRequest.has("rs")) {
            chartResolution = jsonRequest.getInt("rs");
        }
        return chartResolution;
    }

    private boolean isAlertChart(String id) throws JSONException {
        return id.startsWith("_alert_:");
    }

    private boolean isGroupedStatisticsChart(String id) throws JSONException {
        return id.startsWith("_gs_:");
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
        if (jsonRequest.has("tz")) {
            chartOffset = jsonRequest.getLong("tz") * 60 * 60 * 1000;
        }

        return chartOffset;
    }

    private JSONObject getKeyObjectFromQueryString(String queryString) throws JSONException {
        JSONObject keyObject = new JSONObject();

        if (queryString != null && queryString.contains("=")) {
            for (String qsPart : queryString.split("\\&")) {
                if (qsPart.startsWith("?")) {
                    qsPart = qsPart.substring(1);
                }
                log.info("Found QS Part: " + qsPart);
                String[] keyValue = qsPart.split("=");
                if (keyValue.length == 2) {
                    keyObject.put(keyValue[0], keyValue[1]);
                }
            }
        }

        return keyObject;
    }

    @Override
    public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
        String jsonResponse = "";

        HttpRequest request = (HttpRequest)e.getMessage();
        String uri = request.getUri();
        String id = UriUtil.getIdFromUri(uri, "chart_models");
        String cookieUuidToken = getCookieValue(e, "uuidToken");
        
        User loggedInUser = getLoggedInUser(cookieUuidToken);

        JSONObject keyObject = new JSONObject();

        if (id != null) {
            if (id.indexOf("?") > 0) {
                keyObject = getKeyObjectFromQueryString(id.substring(id.indexOf("?")));
                id = id.substring(0, id.indexOf("?"));
            }
        }

        log.info("id: " + id);
        log.info("keyObject: " + keyObject.toString());
        try {

            if (isUser(loggedInUser) && id != null) {
                String chartId = id;
                String pathFromClient = id;
                String chartPath = null;

                int chartTimespan = getChartTimeSpan(keyObject);
                int chartResolution = getChartResolution(keyObject);
                long chartOffset = getChartOffset(keyObject);

                Long fromPeriod = getFromPeriod(chartTimespan, keyObject);
                Long toPeriod = getToPeriod(keyObject);

                List<LiveStatistics> liveList = null;
                String seriesLabel = null;
                Alert alert = null;
                GroupedStatistics groupedStatistics = null;
                XYDataSetCollection valueCollection = new XYDataSetCollection();

                //TODO: This if-else code block needs refactoring. Its not DRY
                if (isAlertChart(id)) {
                    id = id.replaceAll("\\%20", " ");
                    String alertName = id.substring(8, id.length());
                    log.info("isAlert! " + alertName);
                    alert = getBerkeleyTreeMenuService().getAlert(alertName, loggedInUser.getAccountName());
                    if (alert != null) {
                        chartPath = alert.getGuiPath();
                        seriesLabel = "Alert: " + alert.getAlertName();
                    }

                    liveList = getBerkeleyTreeMenuService().getLiveStatistics(chartPath, loggedInUser.getAccountName(), fromPeriod, toPeriod);
                    Collections.sort(liveList);
                    valueCollection = ChartUtil.generateChart(liveList, seriesLabel, fromPeriod * 15000, toPeriod * 15000, chartResolution);
                    valueCollection.addDataList(ChartUtil.buildWarningList(alert, AlertStatus.CRITICAL, fromPeriod * 15000, toPeriod * 15000));
                    valueCollection.addDataList(ChartUtil.buildWarningList(alert, AlertStatus.WARNING, fromPeriod * 15000, toPeriod * 15000));

                    log.info("alert: " + alert);
                    log.info("chartPath: " + chartPath);
                } else if (isGroupedStatisticsChart(id)) {
                    id = id.replaceAll("\\%20", " ");
                    chartPath = id;
                    String groupName = id.substring(5, id.length());

                    log.info("isGroupedStat! " + groupName);
                    groupedStatistics = getBerkeleyTreeMenuService().getGroupedStatistics(groupName, loggedInUser.getAccountName());
                    if (groupedStatistics != null) {
                        log.info("groupedStats: " + groupedStatistics.getName() + " :. " + groupedStatistics.getGroupedPathList().size());
                        seriesLabel = "Grouped Statistics: " + groupedStatistics.getName();
                        for (String gsPath : groupedStatistics.getGroupedPathList()) {
                            log.info("\tgroupedStats Path: " + gsPath);
                            liveList = getBerkeleyTreeMenuService().getLiveStatistics(gsPath, loggedInUser.getAccountName(), fromPeriod, toPeriod);
                            Collections.sort(liveList);
                            for (XYDataList dataList : ChartUtil.generateChart(liveList, gsPath, fromPeriod * 15000, toPeriod * 15000, chartResolution).getDataList()) {
                                valueCollection.addDataList(dataList);
                            }
                        }
                    }
                } else {
                    id = id.replaceAll("\\%20", " ");
                    chartPath = id;
                    log.info("ID: " + id);
                    seriesLabel = chartPath;
                    liveList = getBerkeleyTreeMenuService().getLiveStatistics(chartPath, loggedInUser.getAccountName(), fromPeriod, toPeriod);
                    Collections.sort(liveList);
                    valueCollection = ChartUtil.generateChart(liveList, seriesLabel, fromPeriod * 15000, toPeriod * 15000, chartResolution);
                }

                Statistics statistics = getBerkeleyTreeMenuService().getTreeMenu(chartPath, loggedInUser.getAccountName());
                //if (statistics != null || isGroupedStatisticsChart(keyObject) || isAlertChart(keyObject)) {
                jsonResponse = BuildJsonObjectsUtil.generateChartData2(chartId, chartPath, valueCollection, chartOffset);


                //} else {
                //   jsonResponse = "{\"chart_model\": \"" + seriesLabel + "\", \"table\": " + BuildJsonObjectsUtil.generateArrayOfEndNodesStartingWith(getBerkeleyTreeMenuService().getTreeMenu(), seriesLabel) + ", \"chart\": null}";
                //}

                
                log.info("Got Chart Data:\n" + jsonResponse);
            }
        } catch (JSONException jsonException) {
            throw new IOException("Unable to process JSON Request", jsonException);
        }

        writeContentsToBuffer(ctx, jsonResponse, "text/json");
    }
}
