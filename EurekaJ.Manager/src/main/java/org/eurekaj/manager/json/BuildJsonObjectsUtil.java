package org.eurekaj.manager.json;

import java.util.HashMap;
import java.util.List;

import org.eurekaj.manager.berkeley.treemenu.TreeMenuNode;
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
	
	public static JSONObject buildLeafNodeList(String nodeListId, String parentNodePath, List<TreeMenuNode> nodeList) throws JSONException {
		JSONObject parentObject = new JSONObject();
		
		JSONArray nodeArray = new JSONArray();
		
		int guid = 0;
		for (TreeMenuNode node : nodeList) {
			String guiPathAfterParent = node.getGuiPath().substring(parentNodePath.length()+1);
			if (guiPathAfterParent.split(":").length == 1) {
				nodeArray.put(buildTreeNode((++guid), node.getGuiPath()));
			}
		}
		
		parentObject.put(nodeListId, nodeArray);
		
		return parentObject;
	}
}
