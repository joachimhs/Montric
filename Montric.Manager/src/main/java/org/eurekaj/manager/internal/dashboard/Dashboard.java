/**
    EurekaJ Profiler - http://eurekaj.haagen.name
    
    Copyright (C) 2010-2011 Joachim Haagen Skeie

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
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
