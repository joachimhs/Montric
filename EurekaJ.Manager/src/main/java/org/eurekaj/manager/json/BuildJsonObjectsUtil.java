package org.eurekaj.manager.json;

import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;

import com.google.gson.JsonArray;
import org.eurekaj.manager.berkeley.treemenu.TreeMenuNode;
import org.eurekaj.manager.perst.alert.Alert;
import org.eurekaj.manager.perst.statistics.GroupedStatistics;
import org.jsflot.xydata.XYDataList;
import org.jsflot.xydata.XYDataPoint;
import org.jsflot.xydata.XYDataSetCollection;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class BuildJsonObjectsUtil {

	public static JSONObject buildTreeTypeMenuJsonObject(String treeId, List<TreeMenuNode> nodeList, int startLevel, int stopLevel, boolean includeCharts) throws JSONException {
		HashMap<String, JSONObject> nodesBuilt = new HashMap<String, JSONObject>();
		
		JSONObject parentObject = new JSONObject();
		
		JSONArray treeArray = new JSONArray();
		
		int guid = 0;
		
		for (TreeMenuNode node : nodeList) {
			String[] splitNodePathArray = node.getGuiPath().split(":");
			int splitArrayIndex = 0;
            int maxSplitArrayIndex = splitNodePathArray.length-1;
            if (includeCharts) {
                maxSplitArrayIndex = splitNodePathArray.length;
            }
			String currPath = "";
			do {
				 currPath += splitNodePathArray[splitArrayIndex];
				if (nodesBuilt.get(currPath) == null && splitArrayIndex >= startLevel) {
					JSONObject jsonNode = buildTreeNode((++guid), currPath, nodesBuilt);
					nodesBuilt.put(currPath, jsonNode);
				}
				currPath += ":";

				splitArrayIndex++;
			} while(splitArrayIndex <  maxSplitArrayIndex && splitArrayIndex < stopLevel);
			
			/*
			//Add the last node to the "availableCharts" property

			if (splitNodePathArray.length >= 2) {
				String chartPath = currPath + splitNodePathArray[splitNodePathArray.length-1];
				String parentPath = currPath.substring(0, currPath.length() -1);
				
				JSONObject parentJson = nodesBuilt.get(parentPath);
				JSONArray chartArray = parentJson.getJSONArray("availableCharts");
				if (chartArray == null) {
					chartArray = new JSONArray();
					parentJson.put("availableCharts", chartArray);
				}
				chartArray.put(chartPath);
			}             */
			
		}
		
		List<String> sortedObjects = new ArrayList<String>(nodesBuilt.keySet());
		Collections.sort(sortedObjects);
		
		for (String key: sortedObjects) {
			treeArray.put(nodesBuilt.get(key));
		}
		
		parentObject.put(treeId, treeArray);
		
		return parentObject;
	}
	
	private static JSONObject buildTreeNode(int guid, String guiPath, HashMap<String, JSONObject> nodesBuilt) throws JSONException {
		JSONObject treeJson = new JSONObject();
		treeJson.put("isSelected", false);
		treeJson.put("guiPath", guiPath);
		treeJson.put("treeItemIsExpanded", false);
		treeJson.put("name", guiPath);
		treeJson.put("parentPath", JSONObject.NULL);
		treeJson.put("hasChildren", false);
		treeJson.put("childrenNodes", new JSONArray());
        JSONArray chartGridArray = new JSONArray();
        chartGridArray.put(guiPath);
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
			nodeName = guiPath.substring((lastColonIndex+1),guiPath.length());
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
	
	public static JSONObject buildLeafNodeList(String nodeListId, String parentNodePath, List<TreeMenuNode> nodeList, GroupedStatistics groupedStatistics) throws JSONException {
		JSONObject parentObject = new JSONObject();
		
		JSONArray nodeArray = new JSONArray();
		
		int guid = 0;
		for (TreeMenuNode node : nodeList) {
			String guiPathAfterParent = node.getGuiPath().substring(parentNodePath.length()+1);
			if (guiPathAfterParent.split(":").length == 1) {
				nodeArray.put(buildTreeNode((++guid), node.getGuiPath(), null));
			}
		}
		
		if (groupedStatistics != null) {
			nodeArray.put(buildTreeNode((++guid), groupedStatistics.getSourceGuiPath(), null));
		}
		
		parentObject.put(nodeListId, nodeArray);
		
		return parentObject;
	}
	
	public static String generateChartData(String chartId, String label, XYDataSetCollection xyCollection) throws JSONException {
		//content: [ {label: 'set1', data:[[0,0]]}, {label: 'set2', data:[[0,0]]} ],
		
		StringBuilder dataArraySB = new StringBuilder();
		NumberFormat nf = NumberFormat.getNumberInstance(Locale.US);
		nf.setMaximumFractionDigits(3);
		nf.setGroupingUsed(false);
		//dataArraySB.append("{\"");
		
		//[{"label":"set1", "data":[[1,1],[2,2],[3,3]]} ]
		
		//dataArraySB.append(chartId).append("\": [ ");
		int collectionIndex = 0;
		for (XYDataList list : xyCollection.getDataList()) {
			dataArraySB.append("{\"label\": \"").append(list.getLabel()).append("\", \"data\": [");
			for (int i = 0; i < list.size() - 1; i++) {
				XYDataPoint p = list.get(i);
				String pointLabel = "";
				if (p.getPointLabel() != null) {
					pointLabel = ", '" + p.getPointLabel() + "'";
				}
				
				dataArraySB.append("[").append(nf.format(p.getX())).append(",").append(nf.format(p.getY())).append("").append(pointLabel).append("]").append(", ");
			}
			
			// Last Row
			if (list.size() > 0) {
				XYDataPoint p = list.get(list.size() - 1);
				String pointLabel = "";
				if (p.getPointLabel() != null) {
					pointLabel = ", '" + p.getPointLabel() + "'";
				}
				dataArraySB.append("[").append(nf.format(p.getX())).append(",").append(nf.format(p.getY())).append(pointLabel).append("]");
			}
			
			collectionIndex++;
			dataArraySB.append("]}");
			if (collectionIndex < xyCollection.getDataList().size()) {
				dataArraySB.append(",");
			}
		}
		
		//dataArraySB.append("]}");
		
		return dataArraySB.toString();
	}

    public static String generateAlertsJson(List<Alert> alerts) throws JSONException{
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

            alertArray.put(alertObject);
        }

        alertsObject.put("alerts", alertArray);

        return alertsObject.toString();
    }
}
