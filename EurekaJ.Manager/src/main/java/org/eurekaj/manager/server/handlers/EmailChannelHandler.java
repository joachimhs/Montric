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
import org.eurekaj.api.datatypes.EmailRecipientGroup;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.json.ParseJsonObjects;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 1/20/11
 * Time: 9:17 AM
 * To change this template use File | Settings | File Templates.
 */
public class EmailChannelHandler extends EurekaJGenericChannelHandler {
	private static final Logger log = Logger.getLogger(EmailChannelHandler.class);
	
	@Override
	public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
        String jsonResponse = "";

        try {
            JSONObject jsonObject = BuildJsonObjectsUtil.extractJsonContents(getHttpMessageContent(e));

            if (isPut(e) || isPost(e)) {
            	EmailRecipientGroup emailRecipientGroup = ParseJsonObjects.parseEmailGroup(jsonObject);
                if (emailRecipientGroup != null && emailRecipientGroup.getEmailRecipientGroupName() != null && emailRecipientGroup.getEmailRecipientGroupName().length() > 0) {
                    getAdministrationService().persistEmailRecipientGroup(emailRecipientGroup);
                }
                jsonResponse = BuildJsonObjectsUtil.generateEmailGroup(getAdministrationService().getEmailRecipientGroup(emailRecipientGroup.getEmailRecipientGroupName())).toString();
            } else if (isGet(e)) {
            	jsonResponse = BuildJsonObjectsUtil.generateEmailGroupsJson(getAdministrationService().getEmailRecipientGroups());
                log.debug("Got Email Groups:\n" + jsonResponse);
            } else if (isDelete(e)) {
            	String groupName = jsonObject.getString("id");
                getAdministrationService().deleteEmailRecipientGroup(groupName);
            }
            
            if ((jsonObject.has("getEmailRecipient"))) {
                jsonResponse = BuildJsonObjectsUtil.generateEmailRecipientJson(jsonObject.getString("getEmailRecipient"));
            }
            
        } catch (JSONException jsonException) {
            throw new IOException("Unable to process JSON Request", jsonException);
        }

        log.info("returning email group: " + jsonResponse);
        writeContentsToBuffer(ctx, jsonResponse);
    }
}
