package org.eurekaJ.manager.util;

import static org.junit.Assert.*;

import org.eurekaj.manager.berkeley.statistics.LiveStatistics;
import org.eurekaj.manager.util.ChartUtil;
import org.jsflot.xydata.XYDataList;
import org.jsflot.xydata.XYDataSetCollection;
import org.junit.Before;
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
    public void setUp() {
        liveStatisticsList = new ArrayList<LiveStatistics>();

        liveStatisticsList.add(new LiveStatistics("guipath", 1295540055000l / 15000, 6l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540070000l / 15000, 8l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540085000l / 15000, 7l));

        liveStatisticsList.add(new LiveStatistics("guipath", 1295540100000l / 15000, 9l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540115000l / 15000, 11l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540130000l / 15000, 7l));

        liveStatisticsList.add(new LiveStatistics("guipath", 1295540145000l / 15000, 12l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540160000l / 15000, 8l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540175000l / 15000, 10l));

        liveStatisticsList.add(new LiveStatistics("guipath", 1295540190000l / 15000, 12l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540205000l / 15000, 11l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540220000l / 15000, 7l));

        liveStatisticsList.add(new LiveStatistics("guipath", 1295540235000l / 15000, 9l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540250000l / 15000, 11l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540265000l / 15000, 10l));

        liveStatisticsList.add(new LiveStatistics("guipath", 1295540280000l / 15000, 12l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540295000l / 15000, 8l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540310000l / 15000, 10l));

        liveStatisticsList.add(new LiveStatistics("guipath", 1295540325000l / 15000, 9l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540340000l / 15000, 11l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540355000l / 15000, 7l));

        liveStatisticsList.add(new LiveStatistics("guipath", 1295540370000l / 15000, 9l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540385000l / 15000, 9l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540400000l / 15000, 11l));

        liveStatisticsList.add(new LiveStatistics("guipath", 1295540415000l / 15000, 7l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540430000l / 15000, 9l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540445000l / 15000, 9l));

        liveStatisticsList.add(new LiveStatistics("guipath", 1295540460000l / 15000, 11l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540475000l / 15000, 7l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540490000l / 15000, 10l));

        liveStatisticsList.add(new LiveStatistics("guipath", 1295540505000l / 15000, 9l));
        liveStatisticsList.add(new LiveStatistics("guipath", 1295540520000l / 15000, 10l));
    }

    @Test
    public void test_that_chart_generator_generates_correct_data_for_data_with_no_holes_and_15_second_resolution() {
        XYDataSetCollection xyDataSetCollection = ChartUtil.generateChart(liveStatisticsList, dateFrom, dateTo, 15);
        assertNotNull(xyDataSetCollection.getDataList().get(0));

        XYDataList xyDataList = xyDataSetCollection.getDataList().get(0);
        assertNotNull(xyDataList.getDataPointList());

        assertEquals(xyDataList.getDataPointList().get(0).getX(), 1295540055000l);
        assertEquals(xyDataList.getDataPointList().get(0).getY(), 6l);
        assertEquals(xyDataList.getDataPointList().get(1).getX(), 1295540070000l);
        assertEquals(xyDataList.getDataPointList().get(1).getY(), 8l);
        assertEquals(xyDataList.getDataPointList().get(2).getX(), 1295540085000l);
        assertEquals(xyDataList.getDataPointList().get(2).getY(), 7l);

        assertEquals(xyDataList.getDataPointList().get(3).getX(), 1295540100000l);
        assertEquals(xyDataList.getDataPointList().get(3).getY(), 9l);
        assertEquals(xyDataList.getDataPointList().get(4).getX(), 1295540115000l);
        assertEquals(xyDataList.getDataPointList().get(4).getY(), 11l);
        assertEquals(xyDataList.getDataPointList().get(5).getX(), 1295540130000l);
        assertEquals(xyDataList.getDataPointList().get(5).getY(), 7l);

        assertEquals(xyDataList.getDataPointList().get(6).getX(), 1295540145000l);
        assertEquals(xyDataList.getDataPointList().get(6).getY(), 12l);
        assertEquals(xyDataList.getDataPointList().get(7).getX(), 1295540160000l);
        assertEquals(xyDataList.getDataPointList().get(7).getY(), 8l);
        assertEquals(xyDataList.getDataPointList().get(8).getX(), 1295540175000l);
        assertEquals(xyDataList.getDataPointList().get(8).getY(), 10l);

        assertEquals(xyDataList.getDataPointList().get(9).getX(), 1295540190000l);
        assertEquals(xyDataList.getDataPointList().get(9).getY(), 12l);
        assertEquals(xyDataList.getDataPointList().get(10).getX(), 1295540205000l);
        assertEquals(xyDataList.getDataPointList().get(10).getY(), 11l);
        assertEquals(xyDataList.getDataPointList().get(11).getX(), 1295540220000l);
        assertEquals(xyDataList.getDataPointList().get(11).getY(), 7l);

        assertEquals(xyDataList.getDataPointList().get(12).getX(), 1295540235000l);
        assertEquals(xyDataList.getDataPointList().get(12).getY(), 9l);
        assertEquals(xyDataList.getDataPointList().get(13).getX(), 1295540250000l);
        assertEquals(xyDataList.getDataPointList().get(13).getY(), 11l);
        assertEquals(xyDataList.getDataPointList().get(14).getX(), 1295540265000l);
        assertEquals(xyDataList.getDataPointList().get(14).getY(), 10l);

        assertEquals(xyDataList.getDataPointList().get(15).getX(), 1295540280000l);
        assertEquals(xyDataList.getDataPointList().get(15).getY(), 12l);
        assertEquals(xyDataList.getDataPointList().get(16).getX(), 1295540295000l);
        assertEquals(xyDataList.getDataPointList().get(16).getY(), 8l);
        assertEquals(xyDataList.getDataPointList().get(17).getX(), 1295540310000l);
        assertEquals(xyDataList.getDataPointList().get(17).getY(), 10l);

        assertEquals(xyDataList.getDataPointList().get(18).getX(), 1295540325000l);
        assertEquals(xyDataList.getDataPointList().get(18).getY(), 9l);
        assertEquals(xyDataList.getDataPointList().get(19).getX(), 1295540340000l);
        assertEquals(xyDataList.getDataPointList().get(19).getY(), 11l);
        assertEquals(xyDataList.getDataPointList().get(20).getX(), 1295540355000l);
        assertEquals(xyDataList.getDataPointList().get(20).getY(), 7l);

        assertEquals(xyDataList.getDataPointList().get(21).getX(), 1295540370000l);
        assertEquals(xyDataList.getDataPointList().get(21).getY(), 9l);
        assertEquals(xyDataList.getDataPointList().get(22).getX(), 1295540385000l);
        assertEquals(xyDataList.getDataPointList().get(22).getY(), 9l);
        assertEquals(xyDataList.getDataPointList().get(23).getX(), 1295540400000l);
        assertEquals(xyDataList.getDataPointList().get(23).getY(), 11l);

        assertEquals(xyDataList.getDataPointList().get(24).getX(), 1295540415000l);
        assertEquals(xyDataList.getDataPointList().get(24).getY(), 7l);
        assertEquals(xyDataList.getDataPointList().get(25).getX(), 1295540430000l);
        assertEquals(xyDataList.getDataPointList().get(25).getY(), 9l);
        assertEquals(xyDataList.getDataPointList().get(26).getX(), 1295540445000l);
        assertEquals(xyDataList.getDataPointList().get(26).getY(), 9l);

        assertEquals(xyDataList.getDataPointList().get(27).getX(), 1295540460000l);
        assertEquals(xyDataList.getDataPointList().get(27).getY(), 11l);
        assertEquals(xyDataList.getDataPointList().get(28).getX(), 1295540475000l);
        assertEquals(xyDataList.getDataPointList().get(28).getY(), 7l);
        assertEquals(xyDataList.getDataPointList().get(29).getX(), 1295540490000l);
        assertEquals(xyDataList.getDataPointList().get(29).getY(), 10l);

        assertEquals(xyDataList.getDataPointList().get(30).getX(), 1295540505000l);
        assertEquals(xyDataList.getDataPointList().get(30).getY(), 9l);

        //The last tick is not included to account for lag between agent and server
        //assertEquals(xyDataList.getDataPointList().get(31).getX(), 1295540520000l);
        //assertEquals(xyDataList.getDataPointList().get(31).getY(), 10l);

    }

    @Test
    public void test_that_chart_generator_generates_correct_data_for_data_with_no_holes_and_30_second_resolution() {
        XYDataSetCollection xyDataSetCollection = ChartUtil.generateChart(liveStatisticsList, dateFrom, dateTo, 30);
        assertNotNull(xyDataSetCollection.getDataList().get(0));

        XYDataList xyDataList = xyDataSetCollection.getDataList().get(0);
        assertNotNull(xyDataList.getDataPointList());

        assertEquals(xyDataList.getDataPointList().get(0).getX(), 1295540055000l);
        assertEquals(xyDataList.getDataPointList().get(0).getY(), 7l);

        assertEquals(xyDataList.getDataPointList().get(1).getX(), 1295540085000l);
        assertEquals(xyDataList.getDataPointList().get(1).getY(), 8l);

        assertEquals(xyDataList.getDataPointList().get(2).getX(), 1295540115000l);
        assertEquals(xyDataList.getDataPointList().get(2).getY(), 9l);

        assertEquals(xyDataList.getDataPointList().get(3).getX(), 1295540145000l);
        assertEquals(xyDataList.getDataPointList().get(3).getY(), 10l);

        assertEquals(xyDataList.getDataPointList().get(4).getX(), 1295540175000l);
        assertEquals(xyDataList.getDataPointList().get(4).getY(), 11l);

        assertEquals(xyDataList.getDataPointList().get(5).getX(), 1295540205000l);
        assertEquals(xyDataList.getDataPointList().get(5).getY(), 9l);

        assertEquals(xyDataList.getDataPointList().get(6).getX(), 1295540235000l);
        assertEquals(xyDataList.getDataPointList().get(6).getY(), 10l);

        assertEquals(xyDataList.getDataPointList().get(7).getX(), 1295540265000l);
        assertEquals(xyDataList.getDataPointList().get(7).getY(), 11l);

        assertEquals(xyDataList.getDataPointList().get(8).getX(), 1295540295000l);
        assertEquals(xyDataList.getDataPointList().get(8).getY(), 9l);

        assertEquals(xyDataList.getDataPointList().get(9).getX(), 1295540325000l);
        assertEquals(xyDataList.getDataPointList().get(9).getY(), 10l);

        assertEquals(xyDataList.getDataPointList().get(10).getX(), 1295540355000l);
        assertEquals(xyDataList.getDataPointList().get(10).getY(), 8l);

        assertEquals(xyDataList.getDataPointList().get(11).getX(), 1295540385000l);
        assertEquals(xyDataList.getDataPointList().get(11).getY(), 10l);

        assertEquals(xyDataList.getDataPointList().get(12).getX(), 1295540415000l);
        assertEquals(xyDataList.getDataPointList().get(12).getY(), 8l);

        assertEquals(xyDataList.getDataPointList().get(13).getX(), 1295540445000l);
        assertEquals(xyDataList.getDataPointList().get(13).getY(), 10l);

        assertEquals(xyDataList.getDataPointList().get(14).getX(), 1295540475000l);
        assertEquals(xyDataList.getDataPointList().get(14).getY(), 8l);

        //The last tick is not included to account for lag between agent and server
        //assertEquals(xyDataList.getDataPointList().get(15).getX(), 1295540505000l);
        //assertEquals(xyDataList.getDataPointList().get(15).getY(), 9l);
    }

    @Test
    public void test_that_chart_generator_generates_correct_data_for_data_with_no_holes_and_180_second_resolution() {
        XYDataSetCollection xyDataSetCollection = ChartUtil.generateChart(liveStatisticsList, dateFrom, dateTo, 180);
        assertNotNull(xyDataSetCollection.getDataList().get(0));

        XYDataList xyDataList = xyDataSetCollection.getDataList().get(0);
        assertNotNull(xyDataList.getDataPointList());

        //108 / 12 = 9
        assertEquals(xyDataList.getDataPointList().get(0).getX(), 1295540055000l);
        assertEquals(xyDataList.getDataPointList().get(0).getY(), 9l);

        // 116 / 12 = 9
        assertEquals(xyDataList.getDataPointList().get(1).getX(), 1295540235000l);
        assertEquals(xyDataList.getDataPointList().get(1).getY(), 9l);

        //The last tick is not included to account for lag between agent and server

    }

    @Test
    public void test_that_chart_generator_generates_correct_data_for_data_with_holes_and_15_second_resolution() {
        List<LiveStatistics> newStats = new ArrayList<LiveStatistics>();
        for (int i = 0; i < liveStatisticsList.size(); i += 2) {
            newStats.add(liveStatisticsList.get(i));
        }

        XYDataSetCollection xyDataSetCollection = ChartUtil.generateChart(newStats, dateFrom, dateTo, 15);
        assertNotNull(xyDataSetCollection.getDataList().get(0));

        XYDataList xyDataList = xyDataSetCollection.getDataList().get(0);
        assertNotNull(xyDataList.getDataPointList());

        assertEquals(xyDataList.getDataPointList().get(0).getX(), 1295540055000l);
        assertEquals(xyDataList.getDataPointList().get(0).getY(), 6l);
        assertEquals(xyDataList.getDataPointList().get(1).getX(), 1295540070000l);
        assertEquals(xyDataList.getDataPointList().get(1).getY(), null);
        assertEquals(xyDataList.getDataPointList().get(2).getX(), 1295540085000l);
        assertEquals(xyDataList.getDataPointList().get(2).getY(), 7l);

        assertEquals(xyDataList.getDataPointList().get(3).getX(), 1295540100000l);
        assertEquals(xyDataList.getDataPointList().get(3).getY(), null);
        assertEquals(xyDataList.getDataPointList().get(4).getX(), 1295540115000l);
        assertEquals(xyDataList.getDataPointList().get(4).getY(), 11l);
        assertEquals(xyDataList.getDataPointList().get(5).getX(), 1295540130000l);
        assertEquals(xyDataList.getDataPointList().get(5).getY(), null);

        assertEquals(xyDataList.getDataPointList().get(6).getX(), 1295540145000l);
        assertEquals(xyDataList.getDataPointList().get(6).getY(), 12l);
        assertEquals(xyDataList.getDataPointList().get(7).getX(), 1295540160000l);
        assertEquals(xyDataList.getDataPointList().get(7).getY(), null);
        assertEquals(xyDataList.getDataPointList().get(8).getX(), 1295540175000l);
        assertEquals(xyDataList.getDataPointList().get(8).getY(), 10l);

        assertEquals(xyDataList.getDataPointList().get(9).getX(), 1295540190000l);
        assertEquals(xyDataList.getDataPointList().get(9).getY(), null);
        assertEquals(xyDataList.getDataPointList().get(10).getX(), 1295540205000l);
        assertEquals(xyDataList.getDataPointList().get(10).getY(), 11l);
        assertEquals(xyDataList.getDataPointList().get(11).getX(), 1295540220000l);
        assertEquals(xyDataList.getDataPointList().get(11).getY(), null);

        assertEquals(xyDataList.getDataPointList().get(12).getX(), 1295540235000l);
        assertEquals(xyDataList.getDataPointList().get(12).getY(), 9l);
        assertEquals(xyDataList.getDataPointList().get(13).getX(), 1295540250000l);
        assertEquals(xyDataList.getDataPointList().get(13).getY(), null);
        assertEquals(xyDataList.getDataPointList().get(14).getX(), 1295540265000l);
        assertEquals(xyDataList.getDataPointList().get(14).getY(), 10l);

        assertEquals(xyDataList.getDataPointList().get(15).getX(), 1295540280000l);
        assertEquals(xyDataList.getDataPointList().get(15).getY(), null);
        assertEquals(xyDataList.getDataPointList().get(16).getX(), 1295540295000l);
        assertEquals(xyDataList.getDataPointList().get(16).getY(), 8l);
        assertEquals(xyDataList.getDataPointList().get(17).getX(), 1295540310000l);
        assertEquals(xyDataList.getDataPointList().get(17).getY(), null);

        assertEquals(xyDataList.getDataPointList().get(18).getX(), 1295540325000l);
        assertEquals(xyDataList.getDataPointList().get(18).getY(), 9l);
        assertEquals(xyDataList.getDataPointList().get(19).getX(), 1295540340000l);
        assertEquals(xyDataList.getDataPointList().get(19).getY(), null);
        assertEquals(xyDataList.getDataPointList().get(20).getX(), 1295540355000l);
        assertEquals(xyDataList.getDataPointList().get(20).getY(), 7l);

        assertEquals(xyDataList.getDataPointList().get(21).getX(), 1295540370000l);
        assertEquals(xyDataList.getDataPointList().get(21).getY(), null);
        assertEquals(xyDataList.getDataPointList().get(22).getX(), 1295540385000l);
        assertEquals(xyDataList.getDataPointList().get(22).getY(), 9l);
        assertEquals(xyDataList.getDataPointList().get(23).getX(), 1295540400000l);
        assertEquals(xyDataList.getDataPointList().get(23).getY(), null);

        assertEquals(xyDataList.getDataPointList().get(24).getX(), 1295540415000l);
        assertEquals(xyDataList.getDataPointList().get(24).getY(), 7l);
        assertEquals(xyDataList.getDataPointList().get(25).getX(), 1295540430000l);
        assertEquals(xyDataList.getDataPointList().get(25).getY(), null);
        assertEquals(xyDataList.getDataPointList().get(26).getX(), 1295540445000l);
        assertEquals(xyDataList.getDataPointList().get(26).getY(), 9l);

        assertEquals(xyDataList.getDataPointList().get(27).getX(), 1295540460000l);
        assertEquals(xyDataList.getDataPointList().get(27).getY(), null);
        assertEquals(xyDataList.getDataPointList().get(28).getX(), 1295540475000l);
        assertEquals(xyDataList.getDataPointList().get(28).getY(), 7l);
        assertEquals(xyDataList.getDataPointList().get(29).getX(), 1295540490000l);
        assertEquals(xyDataList.getDataPointList().get(29).getY(), null);

        assertEquals(xyDataList.getDataPointList().get(30).getX(), 1295540505000l);
        assertEquals(xyDataList.getDataPointList().get(30).getY(), 9l);

        //The last tick is not included to account for lag between agent and server
        //assertEquals(xyDataList.getDataPointList().get(31).getX(), 1295540520000l);
        //assertEquals(xyDataList.getDataPointList().get(31).getY(), 10l);

    }

    @Test
    public void test_that_chart_generator_generates_correct_data_for_data_with_holes_and_45_second_resolution() {
        List<LiveStatistics> newStats = new ArrayList<LiveStatistics>();
        for (int i = 0; i < liveStatisticsList.size(); i += 2) {
            newStats.add(liveStatisticsList.get(i));
        }

        XYDataSetCollection xyDataSetCollection = ChartUtil.generateChart(newStats, dateFrom, dateTo, 45);
        assertNotNull(xyDataSetCollection.getDataList().get(0));

        XYDataList xyDataList = xyDataSetCollection.getDataList().get(0);
        assertNotNull(xyDataList.getDataPointList());

        assertEquals(xyDataList.getDataPointList().get(0).getX(), 1295540055000l);
        assertEquals(xyDataList.getDataPointList().get(0).getY(), 6l);

        assertEquals(xyDataList.getDataPointList().get(1).getX(), 1295540100000l);
        assertEquals(xyDataList.getDataPointList().get(1).getY(), 11l);

        assertEquals(xyDataList.getDataPointList().get(2).getX(), 1295540145000l);
        assertEquals(xyDataList.getDataPointList().get(2).getY(), 11l);

        assertEquals(xyDataList.getDataPointList().get(3).getX(), 1295540190000l);
        assertEquals(xyDataList.getDataPointList().get(3).getY(), 11l);

        assertEquals(xyDataList.getDataPointList().get(4).getX(), 1295540235000l);
        assertEquals(xyDataList.getDataPointList().get(4).getY(), 9l);

        assertEquals(xyDataList.getDataPointList().get(5).getX(), 1295540280000l);
        assertEquals(xyDataList.getDataPointList().get(5).getY(), 8l);

        assertEquals(xyDataList.getDataPointList().get(6).getX(), 1295540325000l);
        assertEquals(xyDataList.getDataPointList().get(6).getY(), 8l);

        assertEquals(xyDataList.getDataPointList().get(7).getX(), 1295540370000l);
        assertEquals(xyDataList.getDataPointList().get(7).getY(), 9l);

        assertEquals(xyDataList.getDataPointList().get(8).getX(), 1295540415000l);
        assertEquals(xyDataList.getDataPointList().get(8).getY(), 8l);

        assertEquals(xyDataList.getDataPointList().get(9).getX(), 1295540460000l);
        assertEquals(xyDataList.getDataPointList().get(9).getY(), 7l);

        //The last tick is not included to account for lag between agent and server

    }
}
