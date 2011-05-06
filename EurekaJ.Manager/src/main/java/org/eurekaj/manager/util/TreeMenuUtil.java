package org.eurekaj.manager.util;

import org.eurekaj.api.datatypes.TreeMenuNode;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Hashtable;
import java.util.List;


public class TreeMenuUtil {

	public static List<TreeMenuNode> getLeafNodes(List<TreeMenuNode> treeMenuNodeList) {
		List<TreeMenuNode> leafNodes = new ArrayList<TreeMenuNode>();
		Hashtable<String, TreeMenuNode> possibleLeafNodes = new Hashtable<String, TreeMenuNode>();
		Hashtable<String, TreeMenuNode> notLeafNodes = new Hashtable<String, TreeMenuNode>();
		
		for (TreeMenuNode node : treeMenuNodeList) {
			if (node.getGuiPath().contains(":")) {
				String prevPath = node.getGuiPath().substring(0, node.getGuiPath().lastIndexOf(":"));
				
				TreeMenuNode prevNode = possibleLeafNodes.get(prevPath);
				if (prevNode != null) {
					//PrevPath is not a leaf. Remove it from Hash
					possibleLeafNodes.remove(prevPath);
					notLeafNodes.put(prevPath, prevNode);
				}
				
				//Check if this node is a possible leaf
				TreeMenuNode currNode = notLeafNodes.get(node.getGuiPath());
				if (currNode != null) {
					//This is not a leaf node. Skipping
				} else {
					possibleLeafNodes.put(node.getGuiPath(), node);
				}
			} else {
				notLeafNodes.put(node.getGuiPath(), node);
			}
		}
		
		leafNodes.addAll(possibleLeafNodes.values());
		Collections.sort(leafNodes);
		
		return leafNodes;
	}
}
