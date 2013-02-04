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

    public void storeIncomingStatistics(String guiPath,
                                        String accountName,
                                        Long timeperiod,
			                            String value,
                                        ValueType valueType,
                                        UnitType unitType);

    public List<LiveStatistics> getLiveStatistics(String guiPath, String accountName, Long minTimeperiod, Long maxTimeperiod);

    public void deleteLiveStatisticsOlderThan(Date date, String accountName);

    public void deleteLiveStatisticsBetween(String guiPath, String accountName, Long fromTimeperiod, Long toTimeperiod);
}
