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
package org.eurekaj.manager.json;

import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.SortedMap;
import java.util.TreeMap;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.datatypes.EmailRecipientGroup;
import org.eurekaj.api.datatypes.GroupedStatistics;
import org.eurekaj.api.datatypes.TreeMenuNode;
import org.eurekaj.api.datatypes.TriggeredAlert;
import org.jsflot.xydata.XYDataList;
import org.jsflot.xydata.XYDataPoint;
import org.jsflot.xydata.XYDataSetCollection;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

public class BuildJsonObjectsUtil {
	private static final Logger log = Logger.getLogger(BuildJsonObjectsUtil.class);

	public static JSONObject extractJsonContents(String inputString) throws JSONException {
		JSONObject jsonRequestObject;
		
		//If there is no inpu string, return empty JSON
		if (inputString == null) {
			inputString = "{}";
		}
		
        //Append and prepend { and } if its missing - SC 2
        if (!inputString.startsWith("{")) {
        	inputString = "{" + inputString;
        }
        
        if (!inputString.endsWith("}")) {
        	inputString = inputString + "}";
        }
        
        jsonRequestObject = new JSONObject(new JSONTokener(inputString));
		return jsonRequestObject;
	}

    public static JSONArray buildTreeTypeMenuJsonObject(String treeId,
                                                         List<TreeMenuNode> nodeList,
                                                         List<Alert> alertList,
                                                         List<GroupedStatistics> groupedStatisticsList,
                                                         int startLevel,
                                                         int stopLevel,
                                                         boolean includeCharts, String includeChartType) throws JSONException {

        HashMap<String, JSONObject> nodesBuilt = new HashMap<String, JSONObject>();

        JSONObject parentObject = new JSONObject();

        JSONArray treeArray = new JSONArray();

        if (includeChartType == null || (includeChartType != null && includeChartType.equals("chart"))) {
            buildTreeMenuNode(nodeList, startLevel, stopLevel, includeCharts, nodesBuilt);
        }

        if (includeChartType == null || (includeChartType != null && includeChartType.equals("alert"))) {
            buildAlertNode(alertList, nodesBuilt);
        }

        if (includeChartType == null || (includeChartType != null && includeChartType.equals("groupedStatistics"))) {
            buildGroupedStatisticNodes(groupedStatisticsList, nodesBuilt);
        }

        List<String> sortedObjects = new ArrayList<String>(nodesBuilt.keySet());
        Collections.sort(sortedObjects);

        for (String key : sortedObjects) {
            treeArray.put(nodesBuilt.get(key));
        }

        parentObject.put(treeId, treeArray);

        return treeArray;
    }

    private static void buildTreeMenuNode(List<TreeMenuNode> nodeList, int startLevel, int stopLevel, boolean includeCharts, HashMap<String, JSONObject> nodesBuilt) throws JSONException {
        for (TreeMenuNode node : nodeList) {
            String[] splitNodePathArray = node.getGuiPath().split(":");
            int splitArrayIndex = 0;
            int maxSplitArrayIndex = splitNodePathArray.length - 1;
            if (includeCharts) {
                maxSplitArrayIndex = splitNodePathArray.length;
            }
            String currPath = "";
            do {
                currPath += splitNodePathArray[splitArrayIndex];
                if (nodesBuilt.get(currPath) == null && splitArrayIndex >= startLevel) {
                    JSONObject jsonNode = buildTreeNode(currPath, nodesBuilt, "chart");
                    nodesBuilt.put(currPath, jsonNode);
                }
                currPath += ":";

                splitArrayIndex++;
            } while (splitArrayIndex < maxSplitArrayIndex && splitArrayIndex < stopLevel);
        }
    }

    private static void buildAlertNode(List<Alert> alertList, HashMap<String, JSONObject> nodesBuilt) throws JSONException {
    	if (!alertList.isEmpty()) {
    		nodesBuilt.put("Alerts", buildTreeNode("Alerts", nodesBuilt, "alert"));
    	}
    	
        for (Alert alert : alertList) {
            String currPath = alert.getGuiPath();
            //Strip away last node (the alert chart) and add the alert name instead
            if (currPath.contains(":")) {
                currPath = currPath.substring(0, currPath.lastIndexOf(":"));
            }
            currPath += ":" + alert.getAlertName();

            if (nodesBuilt.get(currPath) == null) {
                JSONObject jsonNode = buildTreeNode(currPath, nodesBuilt, "alert");
                nodesBuilt.put(currPath, jsonNode);
            }
            
            //Extra node to put all alerts in the top menu
            String alertPath = "Alerts:" + alert.getAlertName();
            if (nodesBuilt.get(alertPath) == null) {
                JSONObject jsonNode = buildTreeNode(alertPath, nodesBuilt, "alert");
                nodesBuilt.put(alertPath, jsonNode);
            }
        }
    }


    private static void buildGroupedStatisticNodes(List<GroupedStatistics> groupedStatisticsList, HashMap<String, JSONObject> nodesBuilt) throws JSONException {
        if (!groupedStatisticsList.isEmpty()) {
        	nodesBuilt.put("Grouped Statistics", buildTreeNode("Grouped Statistics", nodesBuilt, "groupedStatistics"));
        }

        for (GroupedStatistics groupedStatistics : groupedStatisticsList) {
            String guiPath = "Grouped Statistics:" + groupedStatistics.getName();
            JSONObject jsonNode = buildTreeNode(guiPath, nodesBuilt, "groupedStatistics");
            nodesBuilt.put(guiPath, jsonNode);
        }
    }

    private static JSONObject buildTreeNode(String guiPath, HashMap<String, JSONObject> nodesBuilt, String type) throws JSONException {
        JSONObject treeJson = new JSONObject();
        treeJson.put("id", guiPath);
        treeJson.put("name", guiPath);
        treeJson.put("parentPath", JSONObject.NULL);
        treeJson.put("nodeType", type);
        treeJson.put("children", new JSONArray());

        String chartId = "";
        if (type.equalsIgnoreCase("chart")) {
            chartId = guiPath;
        } else if (type.equalsIgnoreCase("alert")) {
        	chartId = "_alert_:" + guiPath.substring(guiPath.lastIndexOf(":") + 1, guiPath.length());
        } else if (type.equals("groupedStatistics")) {
        	chartId = "_gs_:" + guiPath.substring(guiPath.lastIndexOf(":") + 1, guiPath.length());
        }

        treeJson.put("chart", chartId);

        if (guiPath.contains(":")) {
            //Split GUI Path into name and parent
            treeJson.put("name", getTreeNodeName(guiPath));
            String parentPath = getParentPath(guiPath);
            treeJson.put("parentPath", parentPath);

            //Mark parent objects as having children nodes
            if (nodesBuilt != null && nodesBuilt.get(parentPath) != null) {
                JSONObject parentNode = nodesBuilt.get(parentPath);
                JSONArray childrenArray = parentNode.getJSONArray("children");
                childrenArray.put(guiPath);
            }
        }

        return treeJson;
    }

    private static String getParentPath(String guiPath) {
        String parentPath = null;

        if (guiPath.contains(":")) {
            int lastColonIndex = guiPath.lastIndexOf(":");
            parentPath = guiPath.substring(0, lastColonIndex);
        }

        return parentPath;
    }

    private static String getTreeNodeName(String guiPath) {
        String nodeName = null;

        if (guiPath.contains(":")) {
            int lastColonIndex = guiPath.lastIndexOf(":");
            nodeName = guiPath.substring((lastColonIndex + 1), guiPath.length());
        }

        return nodeName;
    }

    public static JSONObject buildInstrumentationNode(TreeMenuNode node) throws JSONException {
        JSONObject treeNodeJSONObject = new JSONObject();

        if (node != null) {
            treeNodeJSONObject.put("guid", node.getGuiPath());
            treeNodeJSONObject.put("guiPath", node.getGuiPath());
            treeNodeJSONObject.put("name", getTreeNodeName(node.getGuiPath()));
            treeNodeJSONObject.put("parentPath", getParentPath(node.getGuiPath()));
            treeNodeJSONObject.put("isSelected", false);
            treeNodeJSONObject.put("chartGrid", node.getGuiPath());
        }

        return treeNodeJSONObject;
    }

    public static String generateChartData(String chartId, String label, XYDataSetCollection xyCollection, Long chartOffsetMs) throws JSONException {
        //content: [ {label: 'set1', data:[[0,0]]}, {label: 'set2', data:[[0,0]]} ],

        StringBuilder dataArraySB = new StringBuilder();
        NumberFormat nf = NumberFormat.getNumberInstance(Locale.US);
        nf.setMaximumFractionDigits(3);
        nf.setGroupingUsed(false);
        //dataArraySB.append("{\"");

        //[{"label":"set1", "data":[[1,1],[2,2],[3,3]]} ]

        dataArraySB.append("{\"id\": \"" + chartId + "\", \"chartValue\": \"[ ");
        int collectionIndex = 0;
        for (XYDataList list : xyCollection.getDataList()) {
            dataArraySB.append("{\\\"key\\\": \\\"").append(list.getLabel()).append("\\\", \\\"values\\\": [");
            for (int i = 0; i < list.size() - 1; i++) {
                XYDataPoint p = list.get(i);
                String pointLabel = "";
                if (p.getPointLabel() != null) {
                    pointLabel = ", '" + p.getPointLabel() + "'";
                }

                String yVal = null;
                if (p.getY() != null) {
                    yVal = nf.format(p.getY());
                }

                dataArraySB.append("[").append(nf.format(p.getX().longValue() + chartOffsetMs)).append(",").append(yVal).append("").append(pointLabel).append("]").append(", ");
            }

            // Last Row
            if (list.size() > 0) {
                XYDataPoint p = list.get(list.size() - 1);
                String pointLabel = "";
                if (p.getPointLabel() != null) {
                    pointLabel = ", '" + p.getPointLabel() + "'";
                }

                String yVal = null;
                if (p.getY() != null) {
                    yVal = nf.format(p.getY());
                }

                dataArraySB.append("[").append(nf.format(p.getX().longValue() + chartOffsetMs)).append(",").append(yVal).append(pointLabel).append("]");
            }

            collectionIndex++;
            dataArraySB.append("]");
            if (list.getColor() != null && list.getColor().length() >= 6) {
                dataArraySB.append(", \"color\" : \"" + list.getColor() + "\"");
            }
            dataArraySB.append("}");
            if (collectionIndex < xyCollection.getDataList().size()) {
                dataArraySB.append(",");
            }
        }
        dataArraySB.append("]\"");

        dataArraySB.append("}");

        return dataArraySB.toString();
    }

    public static String generateAlertsJson(List<Alert> alerts) throws JSONException {
        JSONObject alertsObject = new JSONObject();

        JSONArray alertArray = new JSONArray();
        for (Alert alert : alerts) {
            JSONObject alertObject = new JSONObject();
            alertObject.put("alertName", alert.getAlertName());
            alertObject.put("alertWarningValue", alert.getWarningValue());
            alertObject.put("alertErrorValue", alert.getErrorValue());
            alertObject.put("alertInstrumentationNode", alert.getGuiPath());
            alertObject.put("alertDelay", alert.getAlertDelay());
            alertObject.put("alertType", alert.getSelectedAlertType().getTypeName());
            alertObject.put("alertActivated", alert.isActivated());

            JSONArray emailGroupArray = new JSONArray();
            for (String emailRecipientGroup : alert.getSelectedEmailSenderList()) {
                emailGroupArray.put(emailRecipientGroup);
            }
            alertObject.put("alertNotifications", emailGroupArray);
            
            JSONArray selectedPluginsArray = new JSONArray();
            for (String selectedPlugin : alert.getSelectedAlertPluginList()) {
            	selectedPluginsArray.put(selectedPlugin);
            }
            alertObject.put("alertPlugins", selectedPluginsArray);

            alertArray.put(alertObject);
        }

        alertsObject.put("alerts", alertArray);

        return alertsObject.toString();
    }
    
    public static String generateAlertPluginsJson(List<String> loadedPlugins) throws JSONException {
    	JSONObject alertPluginsObject = new JSONObject();
    	
    	JSONArray alertPluginArray = new JSONArray();
    	for (String loadedPlugin : loadedPlugins) {
    		JSONObject alertPluginObject = new JSONObject();
    		alertPluginObject.put("alertPluginName", loadedPlugin);
    		
    		alertPluginArray.put(alertPluginObject);
    	}
    	
    	alertPluginsObject.put("alertPlugins", alertPluginArray);
    	
    	return alertPluginsObject.toString();
    }

    public static String generateTriggeredAlertsJson(List<TriggeredAlert> triggeredAlertList) throws JSONException {
        JSONObject triggeredAlertsObject = new JSONObject();

        JSONArray alertArray = new JSONArray();
        int generatedID = 0;
        for (TriggeredAlert triggeredAlert : triggeredAlertList) {
            JSONObject triggeredAlertObject = new JSONObject();
            triggeredAlertObject.put("generatedID", ++generatedID);
            triggeredAlertObject.put("alertName", triggeredAlert.getAlertName());
            triggeredAlertObject.put("triggeredDate", triggeredAlert.getTimeperiod() * 15000);
            triggeredAlertObject.put("errorValue", triggeredAlert.getErrorValue());
            triggeredAlertObject.put("warningValue", triggeredAlert.getWarningValue());
            triggeredAlertObject.put("triggeredValue", triggeredAlert.getAlertValue());
            alertArray.put(triggeredAlertObject);
        }

        triggeredAlertsObject.put("triggeredAlerts", alertArray);

        return triggeredAlertsObject.toString();
    }

    public static String generateInstrumentationGroupsJson(List<GroupedStatistics> groupedStatisticsList) throws JSONException {
        JSONObject igObject = new JSONObject();

        JSONArray igArray = new JSONArray();
        for (GroupedStatistics gs : groupedStatisticsList) {
            JSONObject ig = new JSONObject();
            ig.put("instrumentaionGroupName", gs.getName());
            JSONArray groupsArray = new JSONArray();
            for (String group : gs.getGroupedPathList()) {
                groupsArray.put(group);
            }
            ig.put("instrumentationGroupPath", groupsArray);

            igArray.put(ig);
        }

        igObject.put("instrumentationGroups", igArray);

        return igObject.toString();
    }

    public static String generateEmailGroupsJson(List<EmailRecipientGroup> emailRecipientGroupList) throws JSONException {
        JSONObject emailObjectContainer = new JSONObject();

        JSONArray emailArray = new JSONArray();
        for (EmailRecipientGroup emailGroup : emailRecipientGroupList) {
            JSONObject emailObject = new JSONObject();
            emailObject.put("emailGroupName", emailGroup.getEmailRecipientGroupName());
            emailObject.put("smtpHost", emailGroup.getSmtpServerhost());
            emailObject.put("smtpUsername", emailGroup.getSmtpUsername());

            //For Security reasons the password is never returned to the server after being set
            //emailObject.put("smtpPassword", emailGroup.getSmtpPassword());

            emailObject.put("smtpPort", emailGroup.getPort());
            emailObject.put("smtpUseSSL", emailGroup.isUseSSL());

            JSONArray emailRecipientArray = new JSONArray();
            for (String emailAddress : emailGroup.getEmailRecipientList()) {
                emailRecipientArray.put(emailAddress);
            }

            emailObject.put("emailAddresses", emailRecipientArray);

            emailArray.put(emailObject);
        }

        emailObjectContainer.put("emailGroups", emailArray);

        return emailObjectContainer.toString();
    }

    public static String buildUserData(String username, String userRole) throws JSONException {
        JSONObject userObject = new JSONObject();

        JSONObject userdataObject = new JSONObject();
        userdataObject.put("username", username);
        userdataObject.put("userRole", userRole);

        userObject.put("loggedInUser", userdataObject);

        return userObject.toString();
    }

    public static String generateEmailRecipientJson(String emailAddress) throws JSONException {
        JSONObject emailObject = new JSONObject();

        emailObject.put("emailAddress", emailAddress);

        return emailObject.toString();
    }

    public static String generateArrayOfEndNodesStartingWith(List<TreeMenuNode> treeMenuList, String startingWith) {
        JSONArray jsonArray = new JSONArray();

        SortedMap<String, String> uniqueEndnodes = new TreeMap<String, String>();

        for (TreeMenuNode treeNode : treeMenuList) {
            String nodeid = startingWith + ";" + treeNode.getGuiPath().substring(treeNode.getGuiPath().lastIndexOf(":") + 1, treeNode.getGuiPath().length());

            if (treeNode.getGuiPath().startsWith(startingWith)
                    && uniqueEndnodes.get(nodeid) == null) {
                uniqueEndnodes.put(nodeid, nodeid);
            }
        }

        for (String nodename : uniqueEndnodes.values()) {
            jsonArray.put(nodename);

        }
        return jsonArray.toString();
    }
}
