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
package org.eurekaj.manager.datatypes;

import org.eurekaj.api.datatypes.TreeMenuNode;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/6/11
 * Time: 10:49 AM
 * To change this template use File | Settings | File Templates.
 */
public class ManagerTreeMenuNode implements TreeMenuNode {
    String guiPath;
	String nodeLive;
    private Long oneMinuteAverageLastUpdated;
    private Long fiveMinuteAverageLastUpdated;
    private Long halfHourAverageLastUpdated;
    private Long hourAverageLastUpdated;
    private Long dailyAverageLastUpdated;
    private Long weeklyAverageLastUpdated;

    public ManagerTreeMenuNode(String guiPath, String nodeLive) {
        this();
        this.guiPath = guiPath;
        this.nodeLive = nodeLive;
    }

    public ManagerTreeMenuNode() {
        super();
        halfHourAverageLastUpdated = 0l;
        hourAverageLastUpdated = 0l;
        dailyAverageLastUpdated = 0l;
        weeklyAverageLastUpdated = 0l;
        oneMinuteAverageLastUpdated = 0l;
        fiveMinuteAverageLastUpdated = 0l;
    }

    public ManagerTreeMenuNode(TreeMenuNode treeMenuNode) {
        this();
        this.guiPath = treeMenuNode.getGuiPath();
        this.nodeLive = treeMenuNode.getNodeLive();
    }

    public String getGuiPath() {
        return guiPath;
    }

    public void setGuiPath(String guiPath) {
        this.guiPath = guiPath;
    }

    public String getNodeLive() {
        return nodeLive;
    }

    public Long getOneMinuteAverageLastUpdated() {
        return oneMinuteAverageLastUpdated;
    }

    public void setOneMinuteAverageLastUpdated(Long oneMinuteAverageLastUpdated) {
        this.oneMinuteAverageLastUpdated = oneMinuteAverageLastUpdated;
    }

    public Long getFiveMinuteAverageLastUpdated() {
        return fiveMinuteAverageLastUpdated;
    }

    public void setFiveMinuteAverageLastUpdated(Long fiveMinuteAverageLastUpdated) {
        this.fiveMinuteAverageLastUpdated = fiveMinuteAverageLastUpdated;
    }

    public Long getHalfHourAverageLastUpdated() {
        return halfHourAverageLastUpdated;
    }

    public void setHalfHourAverageLastUpdated(Long halfHourAverageLastUpdated) {
        this.halfHourAverageLastUpdated = halfHourAverageLastUpdated;
    }

    public Long getHourAverageLastUpdated() {
        return hourAverageLastUpdated;
    }

    public void setHourAverageLastUpdated(Long hourAverageLastUpdated) {
        this.hourAverageLastUpdated = hourAverageLastUpdated;
    }

    public Long getDailyAverageLastUpdated() {
        return dailyAverageLastUpdated;
    }

    public void setDailyAverageLastUpdated(Long dailyAverageLastUpdated) {
        this.dailyAverageLastUpdated = dailyAverageLastUpdated;
    }

    public Long getWeeklyAverageLastUpdated() {
        return weeklyAverageLastUpdated;
    }

    public void setWeeklyAverageLastUpdated(Long weeklyAverageLastUpdated) {
        this.weeklyAverageLastUpdated = weeklyAverageLastUpdated;
    }

    public void setNodeLive(String nodeLive) {
        this.nodeLive = nodeLive;
    }

    public int compareTo(TreeMenuNode other) {
		if (other == null || other.getGuiPath() == null) {
			return 1;
		}

		if (this.getGuiPath() == null) {
			return -1;
		}

		return this.getGuiPath().compareTo(other.getGuiPath());
	}
}
