package org.eurekaj.manager.internal.dashboard;

import java.util.ArrayList;
import java.util.List;

//@Entity(version = 1)
public class Dashboard {
	//@PrimaryKey
	private String dashboardName;
	private List<Gadget> gadgetList = new ArrayList<Gadget>();

	public String getDashboardName() {
		return dashboardName;
	}

	public void setDashboardName(String dashboardName) {
		this.dashboardName = dashboardName;
	}

	public List<Gadget> getGadgetList() {
		return gadgetList;
	}

	public void setGadgetList(List<Gadget> gadgetList) {
		this.gadgetList = gadgetList;
	}

}
