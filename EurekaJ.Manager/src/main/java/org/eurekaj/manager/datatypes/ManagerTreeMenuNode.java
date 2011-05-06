package org.eurekaj.manager.datatypes;

import org.eurekaj.api.datatypes.TreeMenuNode;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/6/11
 * Time: 10:49 AM
 * To change this template use File | Settings | File Templates.
 */
public class ManagerTreeMenuNode implements TreeMenuNode {
    String guiPath;
	String nodeLive;

    public ManagerTreeMenuNode(String guiPath, String nodeLive) {
        this.guiPath = guiPath;
        this.nodeLive = nodeLive;
    }

    public ManagerTreeMenuNode() {
    }

    public ManagerTreeMenuNode(TreeMenuNode treeMenuNode) {
        this.guiPath = treeMenuNode.getGuiPath();
        this.nodeLive = treeMenuNode.getNodeLive();
    }

    public String getGuiPath() {
        return guiPath;
    }

    public void setGuiPath(String guiPath) {
        this.guiPath = guiPath;
    }

    public String getNodeLive() {
        return nodeLive;
    }

    public void setNodeLive(String nodeLive) {
        this.nodeLive = nodeLive;
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
