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

import org.eurekaj.api.datatypes.GroupedStatistics;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/6/11
 * Time: 10:29 AM
 * To change this template use File | Settings | File Templates.
 */
public class ManagerGroupedStatistics implements GroupedStatistics {
    private String name;
	private List<String> groupedPathList;

    public ManagerGroupedStatistics(GroupedStatistics groupedStatistics) {
        this.name = groupedStatistics.getName();
        this.groupedPathList = groupedStatistics.getGroupedPathList();
    }

    public ManagerGroupedStatistics() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getGroupedPathList() {
        return groupedPathList;
    }

    public void setGroupedPathList(List<String> groupedPathList) {
        this.groupedPathList = groupedPathList;
    }
}
