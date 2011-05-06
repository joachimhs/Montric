package org.eurekaj.manager.service;

import java.util.List;

import org.eurekaj.manager.internal.DashboardDao;
import org.eurekaj.manager.internal.dashboard.Dashboard;

public class BerkeleyDashboardService implements DashboardService {
	private DashboardDao dashboardDao;
	
	public BerkeleyDashboardService() {
		// TODO Auto-generated constructor stub
	}
	
	public DashboardDao getDashboardDao() {
		return dashboardDao;
	}
	
	public void setDashboardDao(DashboardDao dashboardDao) {
		this.dashboardDao = dashboardDao;
	}
	
	@Override
	public List<Dashboard> getDashboards() {
		return dashboardDao.getDashboards();
	}

	@Override
	public Dashboard getDashboard(String dashboardName) {
		return dashboardDao.getDashboard(dashboardName);
	}

	@Override
	public void persistDashboard(Dashboard dashboard) {
		dashboardDao.persistDashboard(dashboard);
		
	}

	@Override
	public void deleteDashboard(String dashboardName) {
		dashboardDao.deleteDashboard(dashboardName);
	}

}
