package org.eurekaj.manager.task;

import org.eurekaj.manager.service.TreeMenuService;
import org.springframework.web.context.support.WebApplicationContextUtils;

import java.util.Calendar;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 6/10/11
 * Time: 8:25 PM
 * To change this template use File | Settings | File Templates.
 */
public class DeleteOldStatisticsTask {

    private int numDaysToKeepStatistics = 35;
    private TreeMenuService treeMenuService;

    public DeleteOldStatisticsTask() {
        String daysStr = System.getProperty("org.eurekaj.delteStatsOlderThanDays");
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
