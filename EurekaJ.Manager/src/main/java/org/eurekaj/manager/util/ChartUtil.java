package org.eurekaj.manager.util;

import java.util.Date;
import java.util.Hashtable;
import java.util.List;

import org.apache.log4j.Logger;
import org.eurekaj.manager.berkeley.statistics.LiveStatistics;
import org.eurekaj.manager.berkeley.statistics.LiveStatisticsPk;
import org.eurekaj.manager.perst.alert.Alert;
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
			liveHash.put(l.getPk().getTimeperiod() * 15000, l);
		}

        int numTicksInResolution = resolution / 15;

        //Round down to nearest 15 seconds timeperiod
        millisStart = millisStart - 15000 - (millisStart % 15000);
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
	
	public static XYDataList buildWarningList(Alert alert, int warningType, long minXaxis, long maxXaxis) {
		XYDataList errorList = new XYDataList();
		errorList.setLabel("Warning Value");
		if (warningType == Alert.CRITICAL ) {
			errorList.setLabel("Error Value");
		}		
		
		if (alert != null) {
			Double warningValue = alert.getWarningValue();
			Double errorValue = alert.getErrorValue();
			XYDataPoint startPoint = new XYDataPoint();
			startPoint.setX(minXaxis);
			
			XYDataPoint endPoint = new XYDataPoint();
			endPoint.setX(maxXaxis);
			if (warningType == Alert.CRITICAL) {
				startPoint.setY(errorValue);
				endPoint.setY(errorValue);
			} else {
				startPoint.setY(warningValue);
				endPoint.setY(warningValue);
			}
			
			errorList.setColor("#eeff00");
			if (warningType == Alert.CRITICAL) {
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
