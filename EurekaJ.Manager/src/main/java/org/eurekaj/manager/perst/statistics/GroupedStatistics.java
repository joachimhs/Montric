package org.eurekaj.manager.perst.statistics;

import java.util.ArrayList;
import java.util.List;

import com.sleepycat.persist.model.Entity;
import com.sleepycat.persist.model.PrimaryKey;

@Entity(version=2)
public class GroupedStatistics implements Comparable<GroupedStatistics> {
	@PrimaryKey String name;
	private String sourceGuiPath;
	private List<String> groupedPathList;
	
	public GroupedStatistics() {
		groupedPathList = new ArrayList<String>();
	}
	
	public GroupedStatistics(String name, String sourceGuiPath, List<String> groupedPathList) {
		super();
		this.name = name;
		this.sourceGuiPath = sourceGuiPath;
		this.groupedPathList = groupedPathList;
	}

	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getSourceGuiPath() {
		return sourceGuiPath;
	}
	
	public void setSourceGuiPath(String sourceGuiPath) {
		this.sourceGuiPath = sourceGuiPath;
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
				+ ", sourceGuiPath=" + sourceGuiPath + "]";
	}
	
	public int compareTo(GroupedStatistics other) {
		if (other == null || other.getName() == null) {
			return 1;
		}
		
		if (this.getName() == null) {
			return -1;
		}
		
		return this.getName().compareTo(other.getName());
	}
}
