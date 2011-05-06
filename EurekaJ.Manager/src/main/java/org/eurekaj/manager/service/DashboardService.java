package org.eurekaj.manager.service;

import java.util.List;

import org.eurekaj.manager.internal.dashboard.Dashboard;

public interface DashboardService {
	public List<Dashboard> getDashboards();
	
	public Dashboard getDashboard(String dashboardName);
	
	public void persistDashboard(Dashboard dashboard);
	
	public void deleteDashboard(String dashboardName);
}
