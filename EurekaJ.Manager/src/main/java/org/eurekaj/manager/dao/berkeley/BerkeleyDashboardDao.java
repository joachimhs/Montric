package org.eurekaj.manager.dao.berkeley;

import java.util.ArrayList;
import java.util.List;

import org.eurekaj.manager.berkeley.BerkeleyDbEnv;
import org.eurekaj.manager.berkley.dashboard.Dashboard;

import com.sleepycat.persist.EntityCursor;
import com.sleepycat.persist.PrimaryIndex;

public class BerkeleyDashboardDao implements DashboardDao{
	private BerkeleyDbEnv dbEnvironment;
	private PrimaryIndex<String, Dashboard> dashboardPrimaryIdx;
	
	public BerkeleyDashboardDao() {
		// TODO Auto-generated constructor stub
	}
	
	public void setDbEnvironment(BerkeleyDbEnv dbEnvironment) {
		this.dbEnvironment = dbEnvironment;
		dashboardPrimaryIdx = this.dbEnvironment.getDashboardStore().getPrimaryIndex(String.class, Dashboard.class);
	}

	@Override
	public List<Dashboard> getDashboards() {
		List<Dashboard> retList = new ArrayList<Dashboard>();
		EntityCursor<Dashboard> pi_cursor = dashboardPrimaryIdx.entities();
		try {
		    for (Dashboard node : pi_cursor) {
		        retList.add(node);
		    }
		// Always make sure the cursor is closed when we are done with it.
		} finally {
			pi_cursor.close();
		} 
		return retList;
	}

	@Override
	public Dashboard getDashboard(String dashboardName) {
		return dashboardPrimaryIdx.get(dashboardName);
	}

	@Override
	public void persistDashboard(Dashboard dashboard) {
		dashboardPrimaryIdx.put(dashboard);
	}

	@Override
	public void deleteDashboard(String dashboardName) {
		dashboardPrimaryIdx.delete(dashboardName);
	}

}
