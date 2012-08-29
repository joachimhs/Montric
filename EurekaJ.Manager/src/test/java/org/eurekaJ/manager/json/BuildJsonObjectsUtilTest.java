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
package org.eurekaJ.manager.json;

import java.util.ArrayList;
import java.util.List;

import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.datatypes.GroupedStatistics;
import org.eurekaj.api.datatypes.TreeMenuNode;
import org.eurekaj.manager.datatypes.ManagerTreeMenuNode;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.jsflot.xydata.XYDataList;
import org.jsflot.xydata.XYDataPoint;
import org.jsflot.xydata.XYDataSetCollection;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Ignore;
import org.junit.Test;

import static org.junit.Assert.*;

public class BuildJsonObjectsUtilTest {

    @Test
    public void test_that_an_empty_array_creates_empty_json_object() throws JSONException {
        List<TreeMenuNode> emptyList = new ArrayList<TreeMenuNode>();

        JSONArray jsonObject = BuildJsonObjectsUtil.buildTreeTypeMenuJsonObject("treeMenuID", emptyList, new ArrayList<Alert>(), new ArrayList<GroupedStatistics>(), 0, 20, false, "chart");
        String actual = jsonObject.toString();
        assertEquals("[]", actual);
    }

    @Test
    public void test_that_one_node_element_returns_correct_json_object() throws JSONException {
        List<TreeMenuNode> nodeList = new ArrayList<TreeMenuNode>();
        nodeList.add(new ManagerTreeMenuNode("A", "Y"));

        JSONArray jsonObject = BuildJsonObjectsUtil.buildTreeTypeMenuJsonObject("treeMenuID", nodeList, new ArrayList<Alert>(), new ArrayList<GroupedStatistics>(), 0, 20, false, "chart");
        assertEquals("{\"treeMenuID\":[{\"chartGrid\":[\"A\"],\"hasChildren\":false,\"childrenNodes\":[],\"isSelected\":false,\"name\":\"A\",\"treeItemIsExpanded\":false,\"guiPath\":\"A\",\"nodeType\":\"chart\",\"parentPath\":null}]}", jsonObject.toString());
    }

    @Test
    public void test_that_two_node_element_returns_correct_json_object() throws JSONException {
        List<TreeMenuNode> nodeList = new ArrayList<TreeMenuNode>();
        nodeList.add(new ManagerTreeMenuNode("A", "Y"));
        nodeList.add(new ManagerTreeMenuNode("B", "Y"));

        StringBuilder expected = new StringBuilder();
        expected.append("{\"treeMenuID\":[");
        expected.append("{\"chartGrid\":[\"A\"],\"hasChildren\":false,\"childrenNodes\":[],\"isSelected\":false,\"name\":\"A\",\"treeItemIsExpanded\":false,\"guiPath\":\"A\",\"nodeType\":\"chart\",\"parentPath\":null}");
        expected.append(",");
        expected.append("{\"chartGrid\":[\"B\"],\"hasChildren\":false,\"childrenNodes\":[],\"isSelected\":false,\"name\":\"B\",\"treeItemIsExpanded\":false,\"guiPath\":\"B\",\"nodeType\":\"chart\",\"parentPath\":null}");
        expected.append("]}");

        JSONArray jsonObject = BuildJsonObjectsUtil.buildTreeTypeMenuJsonObject("treeMenuID", nodeList, new ArrayList<Alert>(), new ArrayList<GroupedStatistics>(), 0, 20, false, "chart");
        assertEquals(expected.toString(), jsonObject.toString());
    }

    @Test
    public void test_that_second_level_nodes_generated_correct_json() throws JSONException {
        List<TreeMenuNode> nodeList = new ArrayList<TreeMenuNode>();
        nodeList.add(new ManagerTreeMenuNode("A", "Y"));
        nodeList.add(new ManagerTreeMenuNode("B", "Y"));
        nodeList.add(new ManagerTreeMenuNode("A:C", "Y"));

        StringBuilder expected = new StringBuilder();
        expected.append("{\"treeMenuID\":[");
        expected.append("{\"chartGrid\":[\"A\"],\"hasChildren\":false,\"childrenNodes\":[],\"isSelected\":false,\"name\":\"A\",\"treeItemIsExpanded\":false,\"guiPath\":\"A\",\"nodeType\":\"chart\",\"parentPath\":null}");
        expected.append(",");
        expected.append("{\"chartGrid\":[\"B\"],\"hasChildren\":false,\"childrenNodes\":[],\"isSelected\":false,\"name\":\"B\",\"treeItemIsExpanded\":false,\"guiPath\":\"B\",\"nodeType\":\"chart\",\"parentPath\":null}");
        //expected.append(",");
        //expected.append("{\"guid\":\"A:C\",\"isSelected\":false,\"name\":\"C\",\"treeItemIsExpanded\":false,\"guiPath\":\"A:C\",\"parentPath\":\"A\"}");
        expected.append("]}");

        JSONArray jsonObject = BuildJsonObjectsUtil.buildTreeTypeMenuJsonObject("treeMenuID", nodeList, new ArrayList<Alert>(), new ArrayList<GroupedStatistics>(),  0, 20, false, "chart");
        assertEquals(expected.toString(), jsonObject.toString());
    }

    @Test
    public void test_that_third_level_nodes_generated_correct_json() throws JSONException {
        List<TreeMenuNode> nodeList = new ArrayList<TreeMenuNode>();
        nodeList.add(new ManagerTreeMenuNode("A", "Y"));
        nodeList.add(new ManagerTreeMenuNode("B", "Y"));
        nodeList.add(new ManagerTreeMenuNode("A:C", "Y"));
        nodeList.add(new ManagerTreeMenuNode("A:C:D", "Y"));

        StringBuilder expected = new StringBuilder();
        expected.append("{\"treeMenuID\":[");
        expected.append("{\"chartGrid\":[\"A\"],\"hasChildren\":true,\"childrenNodes\":[\"A:C\"],\"isSelected\":false,\"name\":\"A\",\"treeItemIsExpanded\":false,\"guiPath\":\"A\",\"nodeType\":\"chart\",\"parentPath\":null}");
        expected.append(",");
        expected.append("{\"chartGrid\":[\"A:C\"],\"hasChildren\":false,\"childrenNodes\":[],\"isSelected\":false,\"name\":\"C\",\"treeItemIsExpanded\":false,\"guiPath\":\"A:C\",\"nodeType\":\"chart\",\"parentPath\":\"A\"}");
        expected.append(",");
        expected.append("{\"chartGrid\":[\"B\"],\"hasChildren\":false,\"childrenNodes\":[],\"isSelected\":false,\"name\":\"B\",\"treeItemIsExpanded\":false,\"guiPath\":\"B\",\"nodeType\":\"chart\",\"parentPath\":null}");

        //expected.append(",");
        //expected.append("{\"guid\":4,\"isSelected\":false,\"name\":\"D\",\"treeItemIsExpanded\":false,\"guiPath\":\"A:C:D\",\"parentPath\":\"A:C\"}");
        expected.append("]}");

        JSONArray jsonObject = BuildJsonObjectsUtil.buildTreeTypeMenuJsonObject("treeMenuID", nodeList, new ArrayList<Alert>(), new ArrayList<GroupedStatistics>(),  0, 20, false, "chart");
        assertEquals(expected.toString(), jsonObject.toString());
    }

    @Test
    public void test_that_third_level_nodes_without_parents_are_generated_correct_json() throws JSONException {
        List<TreeMenuNode> nodeList = new ArrayList<TreeMenuNode>();
        nodeList.add(new ManagerTreeMenuNode("A:B:C", "Y"));

        StringBuilder expected = new StringBuilder();
        expected.append("{\"treeMenuID\":[");
        expected.append("{\"chartGrid\":[\"A\"],\"hasChildren\":true,\"childrenNodes\":[\"A:B\"],\"isSelected\":false,\"name\":\"A\",\"treeItemIsExpanded\":false,\"guiPath\":\"A\",\"nodeType\":\"chart\",\"parentPath\":null}");
        expected.append(",");
        expected.append("{\"chartGrid\":[\"A:B\"],\"hasChildren\":false,\"childrenNodes\":[],\"isSelected\":false,\"name\":\"B\",\"treeItemIsExpanded\":false,\"guiPath\":\"A:B\",\"nodeType\":\"chart\",\"parentPath\":\"A\"}");
        //expected.append(",");
        //expected.append("{\"guid\":3,\"isSelected\":false,\"name\":\"C\",\"treeItemIsExpanded\":false,\"guiPath\":\"A:B:C\",\"parentPath\":\"A:B\"}");
        expected.append("]}");

        JSONArray jsonObject = BuildJsonObjectsUtil.buildTreeTypeMenuJsonObject("treeMenuID", nodeList, new ArrayList<Alert>(), new ArrayList<GroupedStatistics>(),  0, 20, false, "chart");
        assertEquals(expected.toString(), jsonObject.toString());
    }

    @Test
    public void test_that_deep_nodes_without_parents_generates_correct_json() throws JSONException {
        List<TreeMenuNode> nodeList = new ArrayList<TreeMenuNode>();
        nodeList.add(new ManagerTreeMenuNode("JSFlotJAgent:Custom:org.jsflot.components.BubbleDataPointComponent:<init>:Max Selftime", "Y"));

        StringBuilder expected = new StringBuilder();
        expected.append("{\"treeMenuID\":[");
        expected.append("{\"chartGrid\":[\"JSFlotJAgent\"],\"hasChildren\":true,\"childrenNodes\":[\"JSFlotJAgent:Custom\"],\"isSelected\":false,\"name\":\"JSFlotJAgent\",\"treeItemIsExpanded\":false,\"guiPath\":\"JSFlotJAgent\",\"nodeType\":\"chart\",\"parentPath\":null}");
        expected.append(",");
        expected.append("{\"chartGrid\":[\"JSFlotJAgent:Custom\"],\"hasChildren\":true,\"childrenNodes\":[\"JSFlotJAgent:Custom:org.jsflot.components.BubbleDataPointComponent\"],\"isSelected\":false,\"name\":\"Custom\",\"treeItemIsExpanded\":false,\"guiPath\":\"JSFlotJAgent:Custom\",\"nodeType\":\"chart\",\"parentPath\":\"JSFlotJAgent\"}");
        expected.append(",");
        expected.append("{\"chartGrid\":[\"JSFlotJAgent:Custom:org.jsflot.components.BubbleDataPointComponent\"],\"hasChildren\":true,\"childrenNodes\":[\"JSFlotJAgent:Custom:org.jsflot.components.BubbleDataPointComponent:<init>\"],\"isSelected\":false,\"name\":\"org.jsflot.components.BubbleDataPointComponent\",\"treeItemIsExpanded\":false,\"guiPath\":\"JSFlotJAgent:Custom:org.jsflot.components.BubbleDataPointComponent\",\"nodeType\":\"chart\",\"parentPath\":\"JSFlotJAgent:Custom\"}");
        expected.append(",");
        expected.append("{\"chartGrid\":[\"JSFlotJAgent:Custom:org.jsflot.components.BubbleDataPointComponent:<init>\"],\"hasChildren\":false,\"childrenNodes\":[],\"isSelected\":false,\"name\":\"<init>\",\"treeItemIsExpanded\":false,\"guiPath\":\"JSFlotJAgent:Custom:org.jsflot.components.BubbleDataPointComponent:<init>\",\"nodeType\":\"chart\",\"parentPath\":\"JSFlotJAgent:Custom:org.jsflot.components.BubbleDataPointComponent\"}");
        //expected.append(",");
        //expected.append("{\"guid\":\"\",\"isSelected\":false,\"name\":\"Max Selftime\",\"treeItemIsExpanded\":false,\"guiPath\":\"JSFlotJAgent:Custom:org.jsflot.components.BubbleDataPointComponent:<init>:Max Selftime\",\"parentPath\":\"JSFlotJAgent:Custom:org.jsflot.components.BubbleDataPointComponent:<init>\"}");
        expected.append("]}");

        JSONArray jsonObject = BuildJsonObjectsUtil.buildTreeTypeMenuJsonObject("treeMenuID", nodeList, new ArrayList<Alert>(), new ArrayList<GroupedStatistics>(),  0, 20, false, "chart");
        assertEquals(expected.toString(), jsonObject.toString());
    }

    @Test
    @Ignore
    public void test_that_XYDataCollection_returns_correct_json() throws JSONException {
        XYDataSetCollection xyCollection = new XYDataSetCollection();
        XYDataList xyList = new XYDataList();
        xyList.setLabel("Set1");
        xyList.addDataPoint(new XYDataPoint(1, 1));
        xyList.addDataPoint(new XYDataPoint(2, 2));
        xyList.addDataPoint(new XYDataPoint(3, 3));
        xyList.addDataPoint(new XYDataPoint(5, 5));
        xyCollection.addDataList(xyList);

        StringBuilder expected = new StringBuilder();
        expected.append("{\"chart\": [ {\"label\": \"Set1\", \"data\": [[1,1], [2,2], [3,3], [5,5]]}],\"instrumentationNode\":\"chartId\"}");
        String jsonString = BuildJsonObjectsUtil.generateChartData("chartId", "something", xyCollection, 0l);
        assertEquals(expected.toString(), jsonString);
    }
}
