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
package org.eurekaj.manager.internal;

import org.eurekaj.manager.internal.dashboard.Dashboard;

import java.util.List;


public class BerkeleyDashboardDao implements DashboardDao{
//	private BerkeleyDbEnv dbEnvironment;
//	private PrimaryIndex<String, Dashboard> dashboardPrimaryIdx;
	
	public BerkeleyDashboardDao() {
		// TODO Auto-generated constructor stub
	}

	
	public List<Dashboard> getDashboards() {
		/*List<Dashboard> retList = new ArrayList<Dashboard>();
		EntityCursor<Dashboard> pi_cursor = dashboardPrimaryIdx.entities();
		try {
		    for (Dashboard node : pi_cursor) {
		        retList.add(node);
		    }
		// Always make sure the cursor is closed when we are done with it.
		} finally {
			pi_cursor.close();
		} 
		return retList;*/
        return  null;
	}

	
	public Dashboard getDashboard(String dashboardName) {
		//return dashboardPrimaryIdx.get(dashboardName);
        return null;
	}

	public void persistDashboard(Dashboard dashboard) {
		//dashboardPrimaryIdx.put(dashboard);
	}

	public void deleteDashboard(String dashboardName) {
		//dashboardPrimaryIdx.delete(dashboardName);
	}

}
