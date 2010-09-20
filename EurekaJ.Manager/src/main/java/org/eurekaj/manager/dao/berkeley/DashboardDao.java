package org.eurekaj.manager.dao.berkeley;

import java.util.List;

import org.eurekaj.manager.berkley.dashboard.Dashboard;

public interface DashboardDao {
	public List<Dashboard> getDashboards();

	public Dashboard getDashboard(String dashboardName);

	public void persistDashboard(Dashboard dashboard);

	public void deleteDashboard(String dashboardName);
}
