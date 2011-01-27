package org.eurekaj.manager.json;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;

import org.eurekaj.manager.berkeley.treemenu.TreeMenuNode;
import org.eurekaj.manager.berkley.administration.EmailRecipientGroup;
import org.eurekaj.manager.perst.alert.Alert;
import org.eurekaj.manager.perst.statistics.GroupedStatistics;
import org.jsflot.xydata.XYDataList;
import org.jsflot.xydata.XYDataPoint;
import org.jsflot.xydata.XYDataSetCollection;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import javax.servlet.http.HttpServletRequest;

public class BuildJsonObjectsUtil {

    public static JSONObject extractRequestJSONContents(HttpServletRequest request) throws IOException, JSONException {
        JSONObject jsonRequestObject = new JSONObject();

        InputStream in = request.getInputStream();

        BufferedReader r = new BufferedReader(new InputStreamReader(in));

        int numChars = 0;
        String contents = "";
        char[] buffer = new char[25];
        while ((numChars = r.read(buffer)) > 0) {
            contents += new String(buffer);
            buffer = new char[25];
        }

        if (contents.length() > 2) {
            jsonRequestObject = new JSONObject(contents);
        }

        return jsonRequestObject;
    }

    public static JSONObject buildTreeTypeMenuJsonObject(String treeId,
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

        return parentObject;
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
        }
    }


    private static void buildGroupedStatisticNodes(List<GroupedStatistics> groupedStatisticsList, HashMap<String, JSONObject> nodesBuilt) throws JSONException {
        nodesBuilt.put("Grouped Statistics", buildTreeNode("Grouped Statistics", nodesBuilt, "groupedStatistics"));

        for (GroupedStatistics groupedStatistics : groupedStatisticsList) {
            String guiPath = "Grouped Statistics:" + groupedStatistics.getName();
            JSONObject jsonNode = buildTreeNode(guiPath, nodesBuilt, "groupedStatistics");
            nodesBuilt.put(guiPath, jsonNode);
        }
    }

    private static JSONObject buildTreeNode(String guiPath, HashMap<String, JSONObject> nodesBuilt, String type) throws JSONException {
        JSONObject treeJson = new JSONObject();
        treeJson.put("isSelected", false);
        treeJson.put("guiPath", guiPath);
        treeJson.put("treeItemIsExpanded", false);
        treeJson.put("name", guiPath);
        treeJson.put("parentPath", JSONObject.NULL);
        treeJson.put("hasChildren", false);
        treeJson.put("nodeType", type);
        treeJson.put("childrenNodes", new JSONArray());

        JSONArray chartGridArray = new JSONArray();
        if (type.equalsIgnoreCase("chart")) {
            chartGridArray.put(guiPath);
        } else if (type.equalsIgnoreCase("alert")) {
            chartGridArray.put("_alert_:" + guiPath.substring(guiPath.lastIndexOf(":") + 1, guiPath.length()));
        } else if (type.equals("groupedStatistics")) {
            chartGridArray.put("_gs_:" + guiPath.substring(guiPath.lastIndexOf(":") + 1, guiPath.length()));
        }

        treeJson.put("chartGrid", chartGridArray);

        if (guiPath.contains(":")) {
            //Split GUI Path into name and parent
            treeJson.put("name", getTreeNodeName(guiPath));
            String parentPath = getParentPath(guiPath);
            treeJson.put("parentPath", parentPath);

            //Mark parent objects as having children nodes
            if (nodesBuilt != null && nodesBuilt.get(parentPath) != null) {
                JSONObject parentNode = nodesBuilt.get(parentPath);
                parentNode.put("hasChildren", true);
                JSONArray childrenArray = parentNode.getJSONArray("childrenNodes");
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

    public static String generateChartData(String chartId, String label, XYDataSetCollection xyCollection) throws JSONException {
        //content: [ {label: 'set1', data:[[0,0]]}, {label: 'set2', data:[[0,0]]} ],

        StringBuilder dataArraySB = new StringBuilder();
        NumberFormat nf = NumberFormat.getNumberInstance(Locale.US);
        nf.setMaximumFractionDigits(3);
        nf.setGroupingUsed(false);
        //dataArraySB.append("{\"");

        //[{"label":"set1", "data":[[1,1],[2,2],[3,3]]} ]

        dataArraySB.append("{\"chart\": [ ");
        int collectionIndex = 0;
        for (XYDataList list : xyCollection.getDataList()) {
            dataArraySB.append("{\"label\": \"").append(list.getLabel()).append("\", \"data\": [");
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

                dataArraySB.append("[").append(nf.format(p.getX())).append(",").append(yVal).append("").append(pointLabel).append("]").append(", ");
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

                dataArraySB.append("[").append(nf.format(p.getX())).append(",").append(yVal).append(pointLabel).append("]");
            }

            collectionIndex++;
            dataArraySB.append("]}");
            if (collectionIndex < xyCollection.getDataList().size()) {
                dataArraySB.append(",");
            }
        }
        dataArraySB.append("]}");

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
            alertObject.put("alertType", Alert.getStringValueForEnumtypes(alert.getSelectedAlertType()));
            alertObject.put("alertActivated", alert.isActivated());

            JSONArray emailGroupArray = new JSONArray();
            for (String emailRecipientGroup : alert.getSelectedEmailSenderList()) {
                emailGroupArray.put(emailRecipientGroup);
            }
            alertObject.put("alertNotifications", emailGroupArray);

            alertArray.put(alertObject);
        }

        alertsObject.put("alerts", alertArray);

        return alertsObject.toString();
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

    public static String generateEmailRecipientJson(String emailAddress) throws JSONException {
        JSONObject emailObject = new JSONObject();

        emailObject.put("emailAddress", emailAddress);

        return emailObject.toString();
    }
}
