package org.eurekaj.simpledb.dao;

import com.amazonaws.services.simpledb.AmazonSimpleDB;
import org.eurekaj.api.dao.SmtpDao;
import org.eurekaj.api.datatypes.EmailRecipientGroup;

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
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public EmailRecipientGroup getEmailRecipientGroup(String groupName) {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public void persistEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup) {
        //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public void deleteEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup) {
        //To change body of implemented methods use File | Settings | File Templates.
    }
}
