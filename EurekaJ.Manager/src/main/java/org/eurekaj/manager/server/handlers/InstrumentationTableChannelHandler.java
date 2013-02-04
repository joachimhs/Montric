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
import java.util.List;

import org.eurekaj.api.datatypes.LiveStatistics;
import org.eurekaj.api.datatypes.Statistics;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 7/9/11
 * Time: 10:43 AM
 * To change this template use File | Settings | File Templates.
 */
public class InstrumentationTableChannelHandler extends ChartChannelHandler {

	@Override
	public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
        String jsonResponse = "";

        try {
            JSONObject jsonObject = BuildJsonObjectsUtil.extractJsonContents(getHttpMessageContent(e));
            if (jsonObject.has("getInstrumentationTableData")) {
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

                    for (Statistics statistics : getBerkeleyTreeMenuService().getTreeMenu()) {
                        if (statistics.getGuiPath().startsWith(startsWith)
                                && statistics.getGuiPath().endsWith(endsWith)) {

                            numNodesFound++;
                            Double averageNodeValue = 0.0d;
                            List<LiveStatistics> liveList = getBerkeleyTreeMenuService().getLiveStatistics(statistics.getGuiPath(), "ACCOUNT", fromPeriod, toPeriod);

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

            writeContentsToBuffer(ctx, jsonResponse);

        } catch (JSONException jsonException) {
            throw new IOException("Unable to process JSON Request", jsonException);
        }
    }
}
