package org.eurekaj.api.service;

import org.eurekaj.api.datatypes.LiveStatistics;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 4/3/12
 * Time: 8:52 PM
 * To change this template use File | Settings | File Templates.
 */
public interface EurekaJProcessIncomingStatisticsService {
    public void processStatistics(List<LiveStatistics> liveStatisticsList);
}
