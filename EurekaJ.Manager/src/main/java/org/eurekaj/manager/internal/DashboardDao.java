package org.eurekaj.manager.internal;

import java.util.List;

import org.eurekaj.manager.internal.dashboard.Dashboard;

public interface DashboardDao {
	public List<Dashboard> getDashboards();

	public Dashboard getDashboard(String dashboardName);

	public void persistDashboard(Dashboard dashboard);

	public void deleteDashboard(String dashboardName);
}
