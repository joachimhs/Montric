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

        if (valueType == ValueType.VALUE) {
            valueReturn = newValue;
        } else if (oldStat != null && oldStat.getValue() != null && valueType == ValueType.AGGREGATE) {
            valueReturn = oldStat.getValue() + newValue;
        } else if (oldStat != null && oldStat.getValue() != null && valueType == ValueType.AVERAGE) {
            valueReturn = (oldStat.getValue() + newValue) / 2;
        }

        return valueReturn;
    }
}
