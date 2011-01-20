package org.eurekaj.manager.servlets;

import org.eurekaj.manager.berkeley.statistics.LiveStatistics;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.perst.alert.Alert;
import org.eurekaj.manager.perst.statistics.GroupedStatistics;
import org.eurekaj.manager.util.ChartUtil;
import org.jsflot.xydata.XYDataList;
import org.jsflot.xydata.XYDataSetCollection;
import org.json.JSONException;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Calendar;
import java.util.Collections;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 1/20/11
 * Time: 9:14 AM
 * To change this template use File | Settings | File Templates.
 */
public class ChartServlet extends EurekaJGenericServlet {


    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String jsonResponse = "";

        try {
            JSONObject jsonObject = BuildJsonObjectsUtil.extractRequestJSONContents(request);
            System.out.println("Accepted JSON: \n" + jsonObject);

            if (jsonObject.has("getInstrumentationChartData")) {
                JSONObject keyObject = jsonObject.getJSONObject("getInstrumentationChartData");
                String chartId = keyObject.getString("id");
                String path = keyObject.getString("path");

                int chartTimespan = 10;
                if (keyObject.has("chartTimespan")) {
                    chartTimespan = keyObject.getInt("chartTimespan");
                }

                int chartResolution = 15;
                if (keyObject.has("chartResolution")) {
                    chartResolution = keyObject.getInt("chartResolution");
                }

                Calendar nowCal = Calendar.getInstance();
                Calendar thenCal = Calendar.getInstance();
                thenCal.add(Calendar.MINUTE, chartTimespan * -1);

                Long fromPeriod = thenCal.getTime().getTime() / 15000;
                Long toPeriod = nowCal.getTime().getTime() / 15000;

                List<LiveStatistics> liveList = getBerkeleyTreeMenuService().getLiveStatistics(path, fromPeriod, toPeriod);
                Collections.sort(liveList);
                GroupedStatistics groupedStatistics = getBerkeleyTreeMenuService().getGroupedStatistics(path);
                XYDataSetCollection valueCollection = new XYDataSetCollection();

                if (groupedStatistics != null) {
                    //There are grouped statistics, all must be added to the chart
                    for (String gsPath : groupedStatistics.getGroupedPathList()) {
                        liveList = getBerkeleyTreeMenuService().getLiveStatistics(gsPath, fromPeriod, toPeriod);
                        Collections.sort(liveList);
                        String seriesLabel = gsPath;
                        if (gsPath.length() > path.length() + 1) {
                            seriesLabel = gsPath.substring(path.length() + 1, gsPath.length());
                        }
                        for (XYDataList dataList : ChartUtil.generateDataset(liveList, seriesLabel, null, thenCal.getTime(), nowCal.getTime(), chartResolution).getDataList()) {
                            valueCollection.addDataList(dataList);
                        }
                    }
                } else {
                    Alert alert = getBerkeleyTreeMenuService().getAlert(path);

                    String seriesLabel = path;
                    if (seriesLabel.contains(":")) {
                        seriesLabel = seriesLabel.substring(path.lastIndexOf(":") + 1, path.length());
                    }
                    valueCollection = ChartUtil.generateDataset(liveList, seriesLabel, alert, thenCal.getTime(), nowCal.getTime(), chartResolution);
                }

                jsonResponse = BuildJsonObjectsUtil.generateChartData(chartId, path, valueCollection);
                System.out.println("Got Chart Data:\n" + jsonResponse);
            }
        } catch (JSONException jsonException) {
            throw new IOException("Unable to process JSON Request", jsonException);
        }

        PrintWriter writer = response.getWriter();
        writer.write(jsonResponse.toString());
        response.flushBuffer();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }
}
