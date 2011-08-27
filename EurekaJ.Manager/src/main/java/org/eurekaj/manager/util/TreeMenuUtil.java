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
