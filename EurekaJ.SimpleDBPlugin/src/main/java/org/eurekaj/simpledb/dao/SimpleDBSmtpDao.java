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
        amazonSimpleDB.putAttributes(new PutAttributesRequest("EurekaJ_Smtp", simpleDBEmailRecipientGroup.getEmailRecipientGroupName(), simpleDBEmailRecipientGroup.getAmazonSimpleDBAttribute()));
    }

    @Override
    public void deleteEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup) {
        Attribute deleteValueAttribute = new Attribute("emailRecipientGroupName", emailRecipientGroup.getEmailRecipientGroupName());
        amazonSimpleDB.deleteAttributes(new DeleteAttributesRequest("EurekaJ_Smtp", emailRecipientGroup.getEmailRecipientGroupName()).withAttributes(deleteValueAttribute));
    }
}
