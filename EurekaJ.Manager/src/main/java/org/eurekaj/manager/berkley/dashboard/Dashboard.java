package org.eurekaj.manager.berkley.dashboard;

import java.util.ArrayList;
import java.util.List;

import com.sleepycat.persist.model.Entity;
import com.sleepycat.persist.model.PrimaryKey;

@Entity(version = 1)
public class Dashboard {
	@PrimaryKey
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
