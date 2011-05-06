package org.eurekaj.manager.internal;

import org.eurekaj.manager.internal.dashboard.Dashboard;

import java.util.ArrayList;
import java.util.List;


public class BerkeleyDashboardDao implements DashboardDao{
//	private BerkeleyDbEnv dbEnvironment;
//	private PrimaryIndex<String, Dashboard> dashboardPrimaryIdx;
	
	public BerkeleyDashboardDao() {
		// TODO Auto-generated constructor stub
	}

	@Override
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

	@Override
	public Dashboard getDashboard(String dashboardName) {
		//return dashboardPrimaryIdx.get(dashboardName);
        return null;
	}

	@Override
	public void persistDashboard(Dashboard dashboard) {
		//dashboardPrimaryIdx.put(dashboard);
	}

	@Override
	public void deleteDashboard(String dashboardName) {
		//dashboardPrimaryIdx.delete(dashboardName);
	}

}
