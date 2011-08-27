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
package org.eurekaj.simpledb.dao;

import com.amazonaws.services.simpledb.AmazonSimpleDB;
import com.amazonaws.services.simpledb.model.*;
import org.eurekaj.api.dao.SmtpDao;
import org.eurekaj.api.datatypes.EmailRecipientGroup;
import org.eurekaj.api.datatypes.GroupedStatistics;
import org.eurekaj.simpledb.SimpleDBEnv;
import org.eurekaj.simpledb.datatypes.SimpleDBEmailRecipientGroup;
import org.eurekaj.simpledb.datatypes.SimpleDBGroupedStatistics;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 5/7/11
 * Time: 11:59 AM
 * To change this template use File | Settings | File Templates.
 */
public class SimpleDBSmtpDao implements SmtpDao{
    private AmazonSimpleDB amazonSimpleDB;

    public SimpleDBSmtpDao(AmazonSimpleDB amazonSimpleDB) {
        this.amazonSimpleDB = amazonSimpleDB;
    }

    @Override
    public List<EmailRecipientGroup> getEmailRecipientGroups() {
        List<EmailRecipientGroup> emailRecipientGroupList = new ArrayList<EmailRecipientGroup>();

        String sdbQuery = "select * from EurekaJ_Smtp";

        SelectRequest selectRequest = new SelectRequest(sdbQuery);
        for (Item item : amazonSimpleDB.select(selectRequest).getItems()) {
            emailRecipientGroupList.add(new SimpleDBEmailRecipientGroup(item.getAttributes()));
        }

        return emailRecipientGroupList;
    }

    @Override
    public EmailRecipientGroup getEmailRecipientGroup(String groupName) {
        GetAttributesResult result = amazonSimpleDB.getAttributes(new GetAttributesRequest("EurekaJ_Smtp", groupName));
        SimpleDBEmailRecipientGroup simpleDBEmailRecipientGroup = new SimpleDBEmailRecipientGroup(result.getAttributes());

        return simpleDBEmailRecipientGroup;
    }

    @Override
    public void persistEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup) {
        SimpleDBEmailRecipientGroup simpleDBEmailRecipientGroup = new SimpleDBEmailRecipientGroup(emailRecipientGroup);

        if (emailRecipientGroup.getSmtpPassword() == null || emailRecipientGroup.getSmtpPassword().length() == 0) {
            //Do not overwrite password with an empty one, use the password stored in the database (if any)
            EmailRecipientGroup oldEmailGroup = getEmailRecipientGroup(emailRecipientGroup.getEmailRecipientGroupName());
            if (oldEmailGroup != null) {
                simpleDBEmailRecipientGroup.setSmtpPassword(oldEmailGroup.getSmtpPassword());
            }
        }

        amazonSimpleDB.putAttributes(new PutAttributesRequest("EurekaJ_Smtp", simpleDBEmailRecipientGroup.getEmailRecipientGroupName(), simpleDBEmailRecipientGroup.getAmazonSimpleDBAttribute()));
    }

    @Override
    public void deleteEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup) {
        Attribute deleteValueAttribute = new Attribute("emailRecipientGroupName", emailRecipientGroup.getEmailRecipientGroupName());
        amazonSimpleDB.deleteAttributes(new DeleteAttributesRequest("EurekaJ_Smtp", emailRecipientGroup.getEmailRecipientGroupName()).withAttributes(deleteValueAttribute));
    }
}
