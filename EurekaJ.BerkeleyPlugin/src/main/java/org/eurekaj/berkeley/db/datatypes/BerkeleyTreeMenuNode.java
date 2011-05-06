package org.eurekaj.berkeley.db.datatypes;

import com.sleepycat.persist.model.Entity;
import com.sleepycat.persist.model.PrimaryKey;
import org.eurekaj.api.datatypes.TreeMenuNode;

@Entity
public class BerkeleyTreeMenuNode implements TreeMenuNode, Comparable<TreeMenuNode> {
	@PrimaryKey String guiPath;
	String nodeLive;
	
	public BerkeleyTreeMenuNode() {
		
	}
	
	public BerkeleyTreeMenuNode(String guiPath, String nodeLive) {
		super();
		this.guiPath = guiPath;
		this.nodeLive = nodeLive;
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
