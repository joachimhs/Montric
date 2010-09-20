package org.eurekaJ.manager.perst.statistics;

import java.util.ArrayList;
import java.util.List;

import com.sleepycat.persist.model.Entity;
import com.sleepycat.persist.model.PrimaryKey;

@Entity
public class GroupedStatistics implements Comparable<GroupedStatistics> {
	@PrimaryKey String guiPath;
	List<String> groupedPathList;
	
	public GroupedStatistics() {
		groupedPathList = new ArrayList<String>();
	}
	
	public GroupedStatistics(String guiPath, List<String> groupedPathList) {
		super();
		this.guiPath = guiPath;
		this.groupedPathList = groupedPathList;
	}

	public String getGuiPath() {
		return guiPath;
	}

	public void setGuiPath(String guiPath) {
		this.guiPath = guiPath;
	}

	public List<String> getGroupedPathList() {
		return groupedPathList;
	}

	public void setGroupedPathList(List<String> groupedPathList) {
		this.groupedPathList = groupedPathList;
	}

	@Override
	public String toString() {
		return "GroupedStatistics [groupedPathList=" + groupedPathList
				+ ", guiPath=" + guiPath + "]";
	}
	
	public int compareTo(GroupedStatistics other) {
		if (other == null || other.getGuiPath() == null) {
			return 1;
		}
		
		if (this.getGuiPath() == null) {
			return -1;
		}
		
		return this.getGuiPath().compareTo(other.getGuiPath());
	}
}
