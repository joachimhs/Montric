package org.eurekaj.api.dao;

import org.eurekaj.api.datatypes.GroupedStatistics;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/5/11
 * Time: 9:34 PM
 * To change this template use File | Settings | File Templates.
 */
public interface GroupedStatisticsDao {
    public void persistGroupInstrumentation(GroupedStatistics groupedStatistics);

    public GroupedStatistics getGroupedStatistics(String name);

    public List<GroupedStatistics> getGroupedStatistics();

}
