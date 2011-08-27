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
package org.eurekaj.manager.util;

import java.util.Hashtable;
import java.util.List;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.datatypes.LiveStatistics;
import org.eurekaj.api.enumtypes.AlertStatus;
import org.jsflot.xydata.XYDataList;
import org.jsflot.xydata.XYDataPoint;
import org.jsflot.xydata.XYDataSetCollection;

public class ChartUtil {
	private static Logger log = Logger.getLogger(ChartUtil.class);

    public static XYDataSetCollection generateChart(List<LiveStatistics> liveList, String seriesLabel, Long millisStart, Long millisEnd, int resolution) {
        XYDataSetCollection valueCollection = new XYDataSetCollection();
        XYDataList valueList = new XYDataList();
        valueList.setLabel(seriesLabel);

        //Hashtable is used for quick lookup
        Hashtable<Long, LiveStatistics> liveHash = new Hashtable<Long, LiveStatistics>();
		for (LiveStatistics l : liveList) {
			liveHash.put(l.getTimeperiod() * 15000, l);
		}

        int numTicksInResolution = resolution / 15;

        //Round down to nearest 15 seconds timeperiod
        millisStart = millisStart - (millisStart % 15000);
		millisEnd = millisEnd - (millisEnd % 15000) + 15000;


        Long currentMillis = millisStart;

        //Iterate over the time-range given and average ticks based on resolution
        while (currentMillis <= (millisEnd - (resolution * 1000))) {
            XYDataPoint currentTick = new XYDataPoint();
            currentTick.setX(currentMillis);
            currentTick.setY(null);
            double aggregatedValue = 0.0d;
            int numStatsInCurrentTick = 0;

            for (int i = 0; i < numTicksInResolution; i++) {
                LiveStatistics currStat = liveHash.get(currentMillis);
                if (currStat == null || currStat.getValue() == null) {
                    //No stat for this timeperiod, skipping
                } else {
                    //Add to current
                    aggregatedValue += currStat.getValue();
                    numStatsInCurrentTick++;
                }

                currentMillis += 15000;
            }

            if (numStatsInCurrentTick > 0) {
                currentTick.setY(aggregatedValue / numStatsInCurrentTick);
            }

            valueList.addDataPoint(currentTick);
        }

        valueCollection.addDataList(valueList);
        return valueCollection;
    }
	
	public static XYDataList buildWarningList(Alert alert, AlertStatus alertStatus, long minXaxis, long maxXaxis) {
		XYDataList errorList = new XYDataList();
		errorList.setLabel("Warning Value");
		if (alertStatus == AlertStatus.CRITICAL ) {
			errorList.setLabel("Error Value");
		}		
		
		if (alert != null) {
			Double warningValue = alert.getWarningValue();
			Double errorValue = alert.getErrorValue();
			XYDataPoint startPoint = new XYDataPoint();
			startPoint.setX(minXaxis);
			
			XYDataPoint endPoint = new XYDataPoint();
			endPoint.setX(maxXaxis);
			if (alertStatus == AlertStatus.CRITICAL) {
				startPoint.setY(errorValue);
				endPoint.setY(errorValue);
			} else {
				startPoint.setY(warningValue);
				endPoint.setY(warningValue);
			}
			
			errorList.setColor("#eeff00");
			if (alertStatus == AlertStatus.CRITICAL) {
				errorList.setColor("#ff0000");
			}
			
			errorList.addDataPoint(startPoint);
			errorList.addDataPoint(endPoint);
			
			errorList.setShowDataPoints(false);
			errorList.setShowLines(true);
			errorList.setFillLines(false);
		}
		
		return errorList;
	}
}
