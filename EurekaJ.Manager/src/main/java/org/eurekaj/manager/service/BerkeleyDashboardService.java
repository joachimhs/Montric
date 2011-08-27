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
