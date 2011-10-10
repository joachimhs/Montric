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
    }
}
