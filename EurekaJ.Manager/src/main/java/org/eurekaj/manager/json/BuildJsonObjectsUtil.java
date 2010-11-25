package org.eurekaj.manager.json;

import java.text.NumberFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;

import org.eurekaj.manager.berkeley.treemenu.TreeMenuNode;
import org.eurekaj.manager.perst.statistics.GroupedStatistics;
import org.jsflot.xydata.XYDataList;
import org.jsflot.xydata.XYDataPoint;
import org.jsflot.xydata.XYDataSetCollection;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class BuildJsonObjectsUtil {

	public static JSONObject buildTreeTypeMenuJsonObject(String treeId, List<TreeMenuNode> nodeList, int startLevel, int stopLevel) throws JSONException {
		HashMap<String, String> nodesBuilt = new HashMap<String, String>();
		
		JSONObject parentObject = new JSONObject();
		
		JSONArray treeArray = new JSONArray();
		
		int guid = 0;
		
		for (TreeMenuNode node : nodeList) {
			String[] splitNodePathArray = node.getGuiPath().split(":");
			int splitArrayIndex = 0;
			String currPath = "";
			do {
				 currPath += splitNodePathArray[splitArrayIndex];
				if (nodesBuilt.get(currPath) == null && splitArrayIndex >= startLevel) {
					JSONObject jsonNode = buildTreeNode((++guid), currPath);
					treeArray.put(jsonNode);
					nodesBuilt.put(currPath, currPath);
				}
				currPath += ":";
				splitArrayIndex++;
			} while(splitArrayIndex < splitNodePathArray.length-1 && splitArrayIndex < stopLevel);
		}
		
		parentObject.put(treeId, treeArray);
		
		return parentObject;
	}
	
	private static JSONObject buildTreeNode(int guid, String guiPath) throws JSONException {
		JSONObject treeJson = new JSONObject();
		treeJson.put("guid", guiPath);
		treeJson.put("isSelected", false);
		treeJson.put("guiPath", guiPath);
		treeJson.put("treeItemIsExpanded", false);
		treeJson.put("name", guiPath);
		treeJson.put("parentPath", JSONObject.NULL);
		
		if (guiPath.contains(":")) {
			//Split GUI Path into name and parent
			int lastColonIndex = guiPath.lastIndexOf(":");
			treeJson.put("name", guiPath.substring((lastColonIndex+1),guiPath.length()));
			treeJson.put("parentPath", guiPath.substring(0, lastColonIndex));	
		}
		
		return treeJson;
	}
	
	public static JSONObject buildLeafNodeList(String nodeListId, String parentNodePath, List<TreeMenuNode> nodeList, GroupedStatistics groupedStatistics) throws JSONException {
		JSONObject parentObject = new JSONObject();
		
		JSONArray nodeArray = new JSONArray();
		
		int guid = 0;
		for (TreeMenuNode node : nodeList) {
			String guiPathAfterParent = node.getGuiPath().substring(parentNodePath.length()+1);
			if (guiPathAfterParent.split(":").length == 1) {
				nodeArray.put(buildTreeNode((++guid), node.getGuiPath()));
			}
		}
		
		if (groupedStatistics != null) {
			nodeArray.put(buildTreeNode((++guid), groupedStatistics.getSourceGuiPath()));
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
		dataArraySB.append("{\"");
		
		//[{"label":"set1", "data":[[1,1],[2,2],[3,3]]} ]
		
		dataArraySB.append(chartId).append("\": [ ");
		int collectionIndex = 0;
		for (XYDataList list : xyCollection.getDataList()) {
			dataArraySB.append("{\"guid\": \"").append(list.getLabel()).append("\",\"label\": \"").append(list.getLabel()).append("\", \"data\": [");
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
		
		dataArraySB.append("]}");
		
		return dataArraySB.toString();
	}
}
