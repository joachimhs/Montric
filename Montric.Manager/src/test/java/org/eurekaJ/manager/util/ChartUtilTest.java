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
package org.eurekaJ.manager.util;

import static org.junit.Assert.*;

import org.eurekaj.api.datatypes.LiveStatistics;
import org.eurekaj.api.datatypes.basic.BasicLiveStatistics;
import org.eurekaj.manager.util.ChartUtil;
import org.jsflot.xydata.XYDataList;
import org.jsflot.xydata.XYDataSetCollection;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 1/20/11
 * Time: 4:21 PM
 * To change this template use File | Settings | File Templates.
 */
public class ChartUtilTest {

    /*
{"label": "% Used", "data":

[[1295540055000,6], [1295540070000,8], [1295540085000,7],
[1295540100000,9], [1295540115000,11], [1295540130000,7],
[1295540145000,12], [1295540160000,8], [1295540175000,10],

[1295540190000,12], [1295540205000,11], [1295540220000,7],
[1295540235000,9], [1295540250000,11], [1295540265000,10],
[1295540280000,12], [1295540295000,8], [1295540310000,10],

[1295540325000,9], [1295540340000,11], [1295540355000,7],
[1295540370000,9], [1295540385000,9], [1295540400000,11],
[1295540415000,7], [1295540430000,9], [1295540445000,9],

[1295540460000,11], [1295540475000,7], [1295540490000,10],
[1295540505000,9], [1295540520000,10]]}
     */

    private List<LiveStatistics> liveStatisticsList;
    private Date dateFrom = new Date(1295540055000l);
    private Date dateTo = new Date(1295540520000l);

    @Before
    @Ignore
    public void setUp() {
        liveStatisticsList = new ArrayList<LiveStatistics>();

        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540055000l / 15000, 6d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540070000l / 15000, 8d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540085000l / 15000, 7d));

        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540100000l / 15000, 9d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540115000l / 15000, 11d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540130000l / 15000, 7d));

        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540145000l / 15000, 12d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540160000l / 15000, 8d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540175000l / 15000, 10d));

        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540190000l / 15000, 12d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540205000l / 15000, 11d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540220000l / 15000, 7d));

        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540235000l / 15000, 9d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540250000l / 15000, 11d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540265000l / 15000, 10d));

        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540280000l / 15000, 12d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540295000l / 15000, 8d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540310000l / 15000, 10d));

        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540325000l / 15000, 9d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540340000l / 15000, 11d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540355000l / 15000, 7d));

        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540370000l / 15000, 9d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540385000l / 15000, 9d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540400000l / 15000, 11d));

        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540415000l / 15000, 7d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540430000l / 15000, 9d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540445000l / 15000, 9d));

        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540460000l / 15000, 11d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540475000l / 15000, 7d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540490000l / 15000, 10d));

        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540505000l / 15000, 9d));
        liveStatisticsList.add(new BasicLiveStatistics("guipath", "ACCOUNT", 1295540520000l / 15000, 10d));
    }

    @Test
    @Ignore
    public void test_that_chart_generator_generates_correct_data_for_data_with_no_holes_and_15_second_resolution() {
        XYDataSetCollection xyDataSetCollection = ChartUtil.generateChart(liveStatisticsList, "name", dateFrom.getTime(), dateTo.getTime(), 15);
        assertNotNull(xyDataSetCollection.getDataList().get(0));

        XYDataList xyDataList = xyDataSetCollection.getDataList().get(0);
        assertNotNull(xyDataList.getDataPointList());
        assertEquals(32, xyDataList.size());

        assertEquals(xyDataList.getDataPointList().get(0).getX().doubleValue(), new Double(1295540055000d), 0.0d);
        assertEquals(xyDataList.getDataPointList().get(0).getY(), 6d);
        assertEquals(xyDataList.getDataPointList().get(1).getX().doubleValue(), 1295540070000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(1).getY(), 8d);
        assertEquals(xyDataList.getDataPointList().get(2).getX().doubleValue(), 1295540085000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(2).getY(), 7d);

        assertEquals(xyDataList.getDataPointList().get(3).getX().doubleValue(), 1295540100000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(3).getY(), 9d);
        assertEquals(xyDataList.getDataPointList().get(4).getX().doubleValue(), 1295540115000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(4).getY(), 11d);
        assertEquals(xyDataList.getDataPointList().get(5).getX().doubleValue(), 1295540130000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(5).getY(), 7d);

        assertEquals(xyDataList.getDataPointList().get(6).getX().doubleValue(), 1295540145000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(6).getY(), 12d);
        assertEquals(xyDataList.getDataPointList().get(7).getX().doubleValue(), 1295540160000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(7).getY(), 8d);
        assertEquals(xyDataList.getDataPointList().get(8).getX().doubleValue(), 1295540175000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(8).getY(), 10d);

        assertEquals(xyDataList.getDataPointList().get(9).getX().doubleValue(), 1295540190000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(9).getY(), 12d);
        assertEquals(xyDataList.getDataPointList().get(10).getX().doubleValue(), 1295540205000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(10).getY(), 11d);
        assertEquals(xyDataList.getDataPointList().get(11).getX().doubleValue(), 1295540220000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(11).getY(), 7d);

        assertEquals(xyDataList.getDataPointList().get(12).getX().doubleValue(), 1295540235000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(12).getY(), 9d);
        assertEquals(xyDataList.getDataPointList().get(13).getX().doubleValue(), 1295540250000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(13).getY(), 11d);
        assertEquals(xyDataList.getDataPointList().get(14).getX().doubleValue(), 1295540265000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(14).getY(), 10d);

        assertEquals(xyDataList.getDataPointList().get(15).getX().doubleValue(), 1295540280000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(15).getY(), 12d);
        assertEquals(xyDataList.getDataPointList().get(16).getX().doubleValue(), 1295540295000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(16).getY(), 8d);
        assertEquals(xyDataList.getDataPointList().get(17).getX().doubleValue(), 1295540310000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(17).getY(), 10d);

        assertEquals(xyDataList.getDataPointList().get(18).getX().doubleValue(), 1295540325000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(18).getY(), 9d);
        assertEquals(xyDataList.getDataPointList().get(19).getX().doubleValue(), 1295540340000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(19).getY(), 11d);
        assertEquals(xyDataList.getDataPointList().get(20).getX().doubleValue(), 1295540355000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(20).getY(), 7d);

        assertEquals(xyDataList.getDataPointList().get(21).getX().doubleValue(), 1295540370000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(21).getY(), 9d);
        assertEquals(xyDataList.getDataPointList().get(22).getX().doubleValue(), 1295540385000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(22).getY(), 9d);
        assertEquals(xyDataList.getDataPointList().get(23).getX().doubleValue(), 1295540400000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(23).getY(), 11d);

        assertEquals(xyDataList.getDataPointList().get(24).getX().doubleValue(), 1295540415000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(24).getY(), 7d);
        assertEquals(xyDataList.getDataPointList().get(25).getX().doubleValue(), 1295540430000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(25).getY(), 9d);
        assertEquals(xyDataList.getDataPointList().get(26).getX().doubleValue(), 1295540445000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(26).getY(), 9d);

        assertEquals(xyDataList.getDataPointList().get(27).getX().doubleValue(), 1295540460000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(27).getY(), 11d);
        assertEquals(xyDataList.getDataPointList().get(28).getX().doubleValue(), 1295540475000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(28).getY(), 7d);
        assertEquals(xyDataList.getDataPointList().get(29).getX().doubleValue(), 1295540490000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(29).getY(), 10d);

        assertEquals(xyDataList.getDataPointList().get(30).getX().doubleValue(), 1295540505000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(30).getY(), 9d);

        //The last tick is not included to account for lag between agent and server
        assertEquals(xyDataList.getDataPointList().get(31).getX().doubleValue(), 1295540520000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(31).getY(), 10d);

    }

    @Test
    @Ignore
    public void test_that_chart_generator_generates_correct_data_for_data_with_no_holes_and_30_second_resolution() {
        XYDataSetCollection xyDataSetCollection = ChartUtil.generateChart(liveStatisticsList, "name", dateFrom.getTime(), dateTo.getTime(), 30);
        assertNotNull(xyDataSetCollection.getDataList().get(0));

        XYDataList xyDataList = xyDataSetCollection.getDataList().get(0);
        assertNotNull(xyDataList.getDataPointList());

        assertEquals(xyDataList.getDataPointList().get(0).getX().doubleValue(), 1295540055000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(0).getY(), 7d);

        assertEquals(xyDataList.getDataPointList().get(1).getX().doubleValue(), 1295540085000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(1).getY(), 8d);

        assertEquals(xyDataList.getDataPointList().get(2).getX().doubleValue(), 1295540115000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(2).getY(), 9d);

        assertEquals(xyDataList.getDataPointList().get(3).getX().doubleValue(), 1295540145000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(3).getY(), 10d);

        assertEquals(xyDataList.getDataPointList().get(4).getX().doubleValue(), 1295540175000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(4).getY(), 11d);

        assertEquals(xyDataList.getDataPointList().get(5).getX().doubleValue(), 1295540205000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(5).getY(), 9d);

        assertEquals(xyDataList.getDataPointList().get(6).getX().doubleValue(), 1295540235000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(6).getY(), 10d);

        assertEquals(xyDataList.getDataPointList().get(7).getX().doubleValue(), 1295540265000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(7).getY(), 11d);

        assertEquals(xyDataList.getDataPointList().get(8).getX().doubleValue(), 1295540295000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(8).getY(), 9d);

        assertEquals(xyDataList.getDataPointList().get(9).getX().doubleValue(), 1295540325000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(9).getY(), 10d);

        assertEquals(xyDataList.getDataPointList().get(10).getX().doubleValue(), 1295540355000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(10).getY(), 8d);

        assertEquals(xyDataList.getDataPointList().get(11).getX().doubleValue(), 1295540385000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(11).getY(), 10d);

        assertEquals(xyDataList.getDataPointList().get(12).getX().doubleValue(), 1295540415000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(12).getY(), 8d);

        assertEquals(xyDataList.getDataPointList().get(13).getX().doubleValue(), 1295540445000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(13).getY(), 10d);

        assertEquals(xyDataList.getDataPointList().get(14).getX().doubleValue(), 1295540475000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(14).getY(), 8d);

        //The last tick is not included to account for lag between agent and server
        //assertEquals(xyDataList.getDataPointList().get(15).getX().doubleValue(), 1295540505000d, 0.0d);
        //assertEquals(xyDataList.getDataPointList().get(15).getY(), 9d);
    }

    @Test
    @Ignore
    public void test_that_chart_generator_generates_correct_data_for_data_with_no_holes_and_180_second_resolution() {
        XYDataSetCollection xyDataSetCollection = ChartUtil.generateChart(liveStatisticsList, "name", dateFrom.getTime(), dateTo.getTime(), 180);
        assertNotNull(xyDataSetCollection.getDataList().get(0));

        XYDataList xyDataList = xyDataSetCollection.getDataList().get(0);
        assertNotNull(xyDataList.getDataPointList());

        //108 / 12 = 9
        assertEquals(xyDataList.getDataPointList().get(0).getX().doubleValue(), 1295540055000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(0).getY(), 9d);

        // 116 / 12 = 9
        assertEquals(xyDataList.getDataPointList().get(1).getX().doubleValue(), 1295540235000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(1).getY(), 9d);

        //The last tick is not included to account for lag between agent and server

    }

    @Test
    @Ignore
    public void test_that_chart_generator_generates_correct_data_for_data_with_holes_and_15_second_resolution() {
        List<LiveStatistics> newStats = new ArrayList<LiveStatistics>();
        for (int i = 0; i < liveStatisticsList.size(); i += 2) {
            newStats.add(liveStatisticsList.get(i));
        }

        XYDataSetCollection xyDataSetCollection = ChartUtil.generateChart(newStats, "name", dateFrom.getTime(), dateTo.getTime(), 15);
        assertNotNull(xyDataSetCollection.getDataList().get(0));

        XYDataList xyDataList = xyDataSetCollection.getDataList().get(0);
        assertNotNull(xyDataList.getDataPointList());

        assertEquals(xyDataList.getDataPointList().get(0).getX().doubleValue(), 1295540055000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(0).getY(), 6d);
        assertEquals(xyDataList.getDataPointList().get(1).getX().doubleValue(), 1295540070000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(1).getY(), null);
        assertEquals(xyDataList.getDataPointList().get(2).getX().doubleValue(), 1295540085000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(2).getY(), 7d);

        assertEquals(xyDataList.getDataPointList().get(3).getX().doubleValue(), 1295540100000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(3).getY(), null);
        assertEquals(xyDataList.getDataPointList().get(4).getX().doubleValue(), 1295540115000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(4).getY(), 11d);
        assertEquals(xyDataList.getDataPointList().get(5).getX().doubleValue(), 1295540130000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(5).getY(), null);

        assertEquals(xyDataList.getDataPointList().get(6).getX().doubleValue(), 1295540145000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(6).getY(), 12d);
        assertEquals(xyDataList.getDataPointList().get(7).getX().doubleValue(), 1295540160000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(7).getY(), null);
        assertEquals(xyDataList.getDataPointList().get(8).getX().doubleValue(), 1295540175000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(8).getY(), 10d);

        assertEquals(xyDataList.getDataPointList().get(9).getX().doubleValue(), 1295540190000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(9).getY(), null);
        assertEquals(xyDataList.getDataPointList().get(10).getX().doubleValue(), 1295540205000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(10).getY(), 11d);
        assertEquals(xyDataList.getDataPointList().get(11).getX().doubleValue(), 1295540220000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(11).getY(), null);

        assertEquals(xyDataList.getDataPointList().get(12).getX().doubleValue(), 1295540235000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(12).getY(), 9d);
        assertEquals(xyDataList.getDataPointList().get(13).getX().doubleValue(), 1295540250000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(13).getY(), null);
        assertEquals(xyDataList.getDataPointList().get(14).getX().doubleValue(), 1295540265000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(14).getY(), 10d);

        assertEquals(xyDataList.getDataPointList().get(15).getX().doubleValue(), 1295540280000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(15).getY(), null);
        assertEquals(xyDataList.getDataPointList().get(16).getX().doubleValue(), 1295540295000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(16).getY(), 8d);
        assertEquals(xyDataList.getDataPointList().get(17).getX().doubleValue(), 1295540310000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(17).getY(), null);

        assertEquals(xyDataList.getDataPointList().get(18).getX().doubleValue(), 1295540325000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(18).getY(), 9d);
        assertEquals(xyDataList.getDataPointList().get(19).getX().doubleValue(), 1295540340000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(19).getY(), null);
        assertEquals(xyDataList.getDataPointList().get(20).getX().doubleValue(), 1295540355000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(20).getY(), 7d);

        assertEquals(xyDataList.getDataPointList().get(21).getX().doubleValue(), 1295540370000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(21).getY(), null);
        assertEquals(xyDataList.getDataPointList().get(22).getX().doubleValue(), 1295540385000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(22).getY(), 9d);
        assertEquals(xyDataList.getDataPointList().get(23).getX().doubleValue(), 1295540400000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(23).getY(), null);

        assertEquals(xyDataList.getDataPointList().get(24).getX().doubleValue(), 1295540415000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(24).getY(), 7d);
        assertEquals(xyDataList.getDataPointList().get(25).getX().doubleValue(), 1295540430000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(25).getY(), null);
        assertEquals(xyDataList.getDataPointList().get(26).getX().doubleValue(), 1295540445000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(26).getY(), 9d);

        assertEquals(xyDataList.getDataPointList().get(27).getX().doubleValue(), 1295540460000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(27).getY(), null);
        assertEquals(xyDataList.getDataPointList().get(28).getX().doubleValue(), 1295540475000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(28).getY(), 7d);
        assertEquals(xyDataList.getDataPointList().get(29).getX().doubleValue(), 1295540490000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(29).getY(), null);

        assertEquals(xyDataList.getDataPointList().get(30).getX().doubleValue(), 1295540505000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(30).getY(), 9d);

        //The last tick is not included to account for lag between agent and server
        //assertEquals(xyDataList.getDataPointList().get(31).getX().doubleValue(), 1295540520000d, 0.0d);
        //assertEquals(xyDataList.getDataPointList().get(31).getY(), 10d);

    }

    @Test
    @Ignore
    public void test_that_chart_generator_generates_correct_data_for_data_with_holes_and_45_second_resolution() {
        List<LiveStatistics> newStats = new ArrayList<LiveStatistics>();
        for (int i = 0; i < liveStatisticsList.size(); i += 2) {
            newStats.add(liveStatisticsList.get(i));
        }

        XYDataSetCollection xyDataSetCollection = ChartUtil.generateChart(newStats, "name", dateFrom.getTime(), dateTo.getTime(), 45);
        assertNotNull(xyDataSetCollection.getDataList().get(0));

        XYDataList xyDataList = xyDataSetCollection.getDataList().get(0);
        assertNotNull(xyDataList.getDataPointList());

        assertEquals(xyDataList.getDataPointList().get(0).getX().doubleValue(), 1295540055000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(0).getY(), 6d);

        assertEquals(xyDataList.getDataPointList().get(1).getX().doubleValue(), 1295540100000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(1).getY(), 11d);

        assertEquals(xyDataList.getDataPointList().get(2).getX().doubleValue(), 1295540145000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(2).getY(), 11d);

        assertEquals(xyDataList.getDataPointList().get(3).getX().doubleValue(), 1295540190000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(3).getY(), 11d);

        assertEquals(xyDataList.getDataPointList().get(4).getX().doubleValue(), 1295540235000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(4).getY(), 9d);

        assertEquals(xyDataList.getDataPointList().get(5).getX().doubleValue(), 1295540280000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(5).getY(), 8d);

        assertEquals(xyDataList.getDataPointList().get(6).getX().doubleValue(), 1295540325000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(6).getY(), 8d);

        assertEquals(xyDataList.getDataPointList().get(7).getX().doubleValue(), 1295540370000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(7).getY(), 9d);

        assertEquals(xyDataList.getDataPointList().get(8).getX().doubleValue(), 1295540415000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(8).getY(), 8d);

        assertEquals(xyDataList.getDataPointList().get(9).getX().doubleValue(), 1295540460000d, 0.0d);
        assertEquals(xyDataList.getDataPointList().get(9).getY(), 7d);

        //The last tick is not included to account for lag between agent and server

    }
}
