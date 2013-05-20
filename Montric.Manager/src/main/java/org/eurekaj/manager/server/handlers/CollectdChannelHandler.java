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

import org.apache.log4j.Logger;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/18/11
 * Time: 10:44 PM
 * To change this template use File | Settings | File Templates.
 */
public class CollectdChannelHandler extends EurekaJGenericChannelHandler {
	private static final Logger log = Logger.getLogger(CollectdChannelHandler.class);
	
	@Override
	public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
		
        String jsonResponse = "";

        try {
            JSONObject jsonObject = BuildJsonObjectsUtil.extractJsonContents(getHttpMessageContent(e));
            /*log.debug("Accepted JSON: \n" + jsonObject);

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
            */
        } catch (JSONException jsonException) {
            throw new IOException("Unable to process JSON Request", jsonException);
        }

        writeContentsToBuffer(ctx, jsonResponse, "text/json");
    }
}
