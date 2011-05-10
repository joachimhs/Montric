package org.eurekaj.simpledb.datatypes;

import org.eurekaj.simpledb.SimpleDBUtil;
import org.junit.Assert;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 5/7/11
 * Time: 3:12 PM
 * To change this template use File | Settings | File Templates.
 */
public class SimpleDBAlertTest {

    @Test
    public void testAtEmailListeMedToEposterBlirFormatertRettTilString() {
        SimpleDBAlert alert = new SimpleDBAlert();
        List<String> emailAddressList = new ArrayList<String>();
        emailAddressList.add("joachim@haagen.name");
        emailAddressList.add("lene@haagen.name");
        alert.setSelectedEmailSenderList(emailAddressList);

        String emailAsString = SimpleDBUtil.getStringListAsString(alert.getSelectedEmailSenderList());
        Assert.assertEquals("joachim@haagen.name,lene@haagen.name", emailAsString);
    }

    @Test
    public void testAtEmailListeMedEnEpostBlirFormatertRettTilString() {
        SimpleDBAlert alert = new SimpleDBAlert();
        List<String> emailAddressList = new ArrayList<String>();
        emailAddressList.add("joachim@haagen.name");
        alert.setSelectedEmailSenderList(emailAddressList);

        String emailAsString = SimpleDBUtil.getStringListAsString(alert.getSelectedEmailSenderList());
        Assert.assertEquals("joachim@haagen.name", emailAsString);
    }

    @Test
    public void testAtTomEmailListeBlirFormatertRettTilString() {
        SimpleDBAlert alert = new SimpleDBAlert();
        List<String> emailAddressList = new ArrayList<String>();
        alert.setSelectedEmailSenderList(emailAddressList);

        String emailAsString = SimpleDBUtil.getStringListAsString(alert.getSelectedEmailSenderList());
        Assert.assertEquals("", emailAsString);
    }

    @Test
    public void testLiveStat() {
        SimpleDBLiveStatistics ls = new SimpleDBLiveStatistics();
        ls.setValue("0.5458984375");

        Assert.assertEquals(new Double(0.5458984375d), ls.getValue());

        System.out.println("value: " + ls.getValue());
    }
}
