package org.eurekaj.api.dao;

import org.eurekaj.api.datatypes.LiveStatistics;
import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.api.enumtypes.ValueType;

import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/5/11
 * Time: 9:34 PM
 * To change this template use File | Settings | File Templates.
 */
public interface LiveStatisticsDao {

    public void storeIncomingStatistics(String guiPath, Long timeperiod,
			String value, ValueType valueType, UnitType unitType);

    public List<LiveStatistics> getLiveStatistics(String guiPath,
			Long minTimeperiod, Long maxTimeperiod);

    public void deleteLiveStatisticsOlderThan(Date date);
}
