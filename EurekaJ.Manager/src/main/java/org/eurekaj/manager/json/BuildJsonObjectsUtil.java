package org.eurekaj.manager.json;

import java.util.List;
import java.util.TreeMap;
import java.util.TreeSet;

import org.eurekaj.manager.berkeley.treemenu.TreeMenuNode;
import org.eurekaj.manager.model.frontend.TreeMenuNodeData;
import org.json.JSONException;
import org.json.JSONObject;
import org.richfaces.model.TreeNode;
import org.richfaces.model.TreeNodeImpl;

public class BuildJsonObjectsUtil {

	public static JSONObject buildTreeMenuJsonObject(List<TreeMenuNode> nodeList) throws JSONException {
		JSONObject treeJson = new JSONObject();
		
		
		
		
		for (TreeMenuNode node : nodeList) {
			treeJson.append(node.getGuiPath(), node.getNodeLive().equalsIgnoreCase("Y"));
		}
		
		return treeJson;
	}
}
