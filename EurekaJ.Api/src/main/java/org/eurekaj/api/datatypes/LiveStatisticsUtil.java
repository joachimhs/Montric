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
package org.eurekaj.api.datatypes;

import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.api.enumtypes.ValueType;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 5/9/11
 * Time: 11:00 PM
 * To change this template use File | Settings | File Templates.
 */
public class LiveStatisticsUtil {
    public static Double calculateValueBasedOnUnitType(Double valueDouble, UnitType unitType) {
        Double valueReturn = null;

        if (valueDouble != null && unitType == UnitType.NS) {
            //From nanoseconds to milliseconds
            valueReturn = valueDouble / 1000000;
        } else if (unitType == UnitType.MS || unitType == UnitType.N) {
            valueReturn = valueDouble;
        } else if (valueDouble != null && unitType == UnitType.S) {
            //From seconds to milliseconds
            valueReturn = valueDouble * 1000;
        }

        return valueReturn;
    }

    public static Double calculateValueBasedOnValueType(LiveStatistics oldStat, Double newValue, ValueType valueType) {
        Double valueReturn = newValue;

        if (newValue == null) {
            //in this case, the return value is NULL regardless.
            valueReturn = null;
        } else if (valueType == ValueType.VALUE) {
            valueReturn = newValue;
        } else if (oldStat != null && oldStat.getValue() != null && valueType == ValueType.AGGREGATE) {
            valueReturn = oldStat.getValue() + newValue;
        } else if (oldStat != null && oldStat.getValue() != null && valueType == ValueType.AVERAGE) {
            valueReturn = (oldStat.getValue() + newValue) / 2;
        }

        return valueReturn;
    }
    
    public static Double calculateValueBasedOnValueType(Double oldValue, Double newValue, ValueType valueType) {
        Double valueReturn = newValue;

        if (newValue == null) {
            //in this case, the return value is NULL regardless.
            valueReturn = null;
        } else if (valueType == ValueType.VALUE) {
            valueReturn = newValue;
        } else if (oldValue != null && valueType == ValueType.AGGREGATE) {
            valueReturn = oldValue + newValue;
        } else if (oldValue != null && valueType == ValueType.AVERAGE) {
            valueReturn = (oldValue + newValue) / 2;
        }

        return valueReturn;
    }
    
    public static Double parseDouble(String strVal) {
		Double retVal = null;
		if (strVal != null) {
			try {
				retVal = Double.parseDouble(strVal);
			} catch (NumberFormatException nfe) {
				retVal = null;
			}
		}
		
		return retVal;
	}
	
	public static Long parseLong(String strVal) {
		Long retVal = null;
		if (strVal != null) {
			try {
				retVal = Long.parseLong(strVal);
			} catch (NumberFormatException nfe) {
				retVal = null;
			}
		}
		
		return retVal;
	}
	
	public static int getFifteensecondTimeperiodsSinceStartOfHour(Long secondsSince1970) {
    	int hoursSince1970 = secondsSince1970.intValue() / 3600;
    	
    	int secondsFromStartOfHour = secondsSince1970.intValue() - (hoursSince1970 * 3600);
    	int fifteensecondTimeperiodsSinceStartOfHour = secondsFromStartOfHour / 15;
    	
    	return fifteensecondTimeperiodsSinceStartOfHour;
    }
}
