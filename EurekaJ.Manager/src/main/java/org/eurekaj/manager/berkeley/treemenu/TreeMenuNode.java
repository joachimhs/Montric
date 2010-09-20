package org.eurekaJ.manager.berkeley.treemenu;

import com.sleepycat.persist.model.Entity;
import com.sleepycat.persist.model.PrimaryKey;

@Entity
public class TreeMenuNode implements Comparable<TreeMenuNode> {
	@PrimaryKey String guiPath;
	String nodeLive;
	boolean hasExecTimeInformation;
	boolean hasCallsPerIntervalInformation;
	boolean hasValueInformation;
	//public IPersistentHash<String, LiveStatistics> liveStatHash;
	
	public TreeMenuNode() {
		
	}
	
	public TreeMenuNode(String guiPath, String nodeLive) {
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

	public boolean isHasExecTimeInformation() {
		return hasExecTimeInformation;
	}

	public void setHasExecTimeInformation(boolean hasExecTimeInformation) {
		this.hasExecTimeInformation = hasExecTimeInformation;
	}

	public boolean isHasCallsPerIntervalInformation() {
		return hasCallsPerIntervalInformation;
	}

	public void setHasCallsPerIntervalInformation(
			boolean hasCallsPerIntervalInformation) {
		this.hasCallsPerIntervalInformation = hasCallsPerIntervalInformation;
	}

	public boolean isHasValueInformation() {
		return hasValueInformation;
	}

	public void setHasValueInformation(boolean hasValueInformation) {
		this.hasValueInformation = hasValueInformation;
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
