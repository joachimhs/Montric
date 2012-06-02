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

import java.io.IOException;

import org.apache.log4j.Logger;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 6/18/11
 * Time: 7:31 PM
 * To change this template use File | Settings | File Templates.
 */
public class UserChannelhandler extends EurekaJGenericChannelHandler {
	private static final Logger log = Logger.getLogger(UserChannelhandler.class);
	
	@Override
	public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
        String jsonResponse = "";

        try {
            JSONObject jsonObject = BuildJsonObjectsUtil.extractJsonContents(getHttpMessageContent(e));

            /*if (jsonObject.has("getLoggedInUser") && SecurityManager.isAuthenticated() ) {
                String username = SecurityManager.getAuthenticatedUsername();
                String userRole = "user";
                if (SecurityManager.isAuthenticatedAsAdmin()) {
                    userRole = "admin";
                }

                jsonResponse = BuildJsonObjectsUtil.buildUserData(username, userRole);
            }*/

        } catch (JSONException jsonException) {
            throw new IOException("Unable to process JSON Request", jsonException);
        }

        writeContentsToBuffer(ctx, jsonResponse);
    }
}
