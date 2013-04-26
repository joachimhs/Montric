package org.eurekaj.api.datatypes.basic;

import java.util.List;

import org.eurekaj.api.datatypes.GroupedStatistics;

public class BasicGroupedStatistics implements GroupedStatistics, Comparable<GroupedStatistics> {
	private String name;
	private String accountName;
	private List<String> groupedPathList;
	
	public BasicGroupedStatistics() {
		// TODO Auto-generated constructor stub
	}
	
	public BasicGroupedStatistics(String name, String accountName,
			List<String> groupedPathList) {
		super();
		this.name = name;
		this.accountName = accountName;
		this.groupedPathList = groupedPathList;
	}

	public BasicGroupedStatistics(GroupedStatistics gs) {
		this(gs.getName(), gs.getAccountName(), gs.getGroupedPathList());
	}

	@Override
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}

	@Override
	public String getAccountName() {
		return accountName;
	}

	public void setAccountName(String accountName) {
		this.accountName = accountName;
	}
	
	@Override
	public List<String> getGroupedPathList() {
		return groupedPathList;
	}
	
	public void setGroupedPathList(List<String> groupedPathList) {
		this.groupedPathList = groupedPathList;
	}

	@Override
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
