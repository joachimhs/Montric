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
package org.eurekaj.manager.task;

import org.eurekaj.manager.service.TreeMenuService;
import org.springframework.web.context.support.WebApplicationContextUtils;

import java.util.Calendar;

public class DeleteOldStatisticsTask {

    private int numDaysToKeepStatistics = 35;
    private TreeMenuService treeMenuService;

    public DeleteOldStatisticsTask() {
        String daysStr = System.getProperty("org.eurekaj.deleteStatsOlderThanDays");
        if (daysStr != null) {
            try {
                numDaysToKeepStatistics = Integer.parseInt(daysStr);
            } catch (NumberFormatException nfe) {
                numDaysToKeepStatistics = 35;
            }
        }
    }

    public void deleteOldStats() {
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DATE, -1 * numDaysToKeepStatistics);

        if (treeMenuService != null) {
            treeMenuService.deleteOldLiveStatistics(cal.getTime());
        }
    }

    public void setTreeMenuService(TreeMenuService treeMenuService) {
        this.treeMenuService = treeMenuService;
    }
}
