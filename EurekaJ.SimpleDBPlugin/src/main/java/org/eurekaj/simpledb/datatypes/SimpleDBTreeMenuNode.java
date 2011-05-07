package org.eurekaj.simpledb.datatypes;

import org.eurekaj.api.datatypes.TreeMenuNode;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 5/7/11
 * Time: 11:30 AM
 * To change this template use File | Settings | File Templates.
 */
public class SimpleDBTreeMenuNode  implements TreeMenuNode, Comparable<TreeMenuNode> {
    String guiPath;
	String nodeLive;

    public SimpleDBTreeMenuNode() {
    }

    public SimpleDBTreeMenuNode(String guiPath, String nodeLive) {
        this.guiPath = guiPath;
        this.nodeLive = nodeLive;
    }

    @Override
    public String getGuiPath() {
        return guiPath;
    }

    @Override
    public String getNodeLive() {
        return nodeLive;
    }

    @Override
    public int compareTo(TreeMenuNode other) {
		if (other == null || other.getGuiPath() == null) {
			return 1;
		}

		if (this.getGuiPath() == null) {
			return -1;
		}

		return this.getGuiPath().compareTo(other.getGuiPath());
	}
}
