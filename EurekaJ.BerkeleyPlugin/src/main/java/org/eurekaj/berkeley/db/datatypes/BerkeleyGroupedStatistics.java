package org.eurekaj.berkeley.db.datatypes;

import java.util.ArrayList;
import java.util.List;

import com.sleepycat.persist.model.Entity;
import com.sleepycat.persist.model.PrimaryKey;
import org.eurekaj.api.datatypes.GroupedStatistics;

@Entity(version=3)
public class BerkeleyGroupedStatistics implements Comparable<BerkeleyGroupedStatistics>, GroupedStatistics {
	@PrimaryKey private String name;
	private List<String> groupedPathList;

    public BerkeleyGroupedStatistics(GroupedStatistics groupedStatistics) {
        this.name = groupedStatistics.getName();
        this.groupedPathList = groupedStatistics.getGroupedPathList();
    }

	public BerkeleyGroupedStatistics() {
		groupedPathList = new ArrayList<String>();
	}
	
	public BerkeleyGroupedStatistics(String name, List<String> groupedPathList) {
		super();
		this.name = name;
		this.groupedPathList = groupedPathList;
	}

	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}


	public List<String> getGroupedPathList() {
		return groupedPathList;
	}

	public void setGroupedPathList(List<String> groupedPathList) {
		this.groupedPathList = groupedPathList;
	}

	@Override
	public String toString() {
		return "BerkeleyGroupedStatistics [groupedPathList=" + groupedPathList + "]";
	}
	
	public int compareTo(BerkeleyGroupedStatistics other) {
		if (other == null || other.getName() == null) {
			return 1;
		}
		
		if (this.getName() == null) {
			return -1;
		}
		
		return this.getName().compareTo(other.getName());
	}
}
