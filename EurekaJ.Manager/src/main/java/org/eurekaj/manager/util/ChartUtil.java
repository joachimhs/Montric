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

    public static XYDataSetCollection generateChart(List<LiveStatistics> liveList, String seriesLabel, Date fromDate, Date toDate, int resolution) {
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
        Long millisStart = fromDate.getTime();
        Long millisEnd = toDate.getTime();

		millisStart = millisStart - 15000 - (millisStart % 15000);
		millisEnd = millisEnd - (millisEnd % 15000) + 15000;


        Long currentMillis = millisStart;
        int offsetMiutes = fromDate.getTimezoneOffset();

        //Iterate over the time-range given and average ticks based on resolution
        while (currentMillis <= (millisEnd - (resolution * 1000))) {
            XYDataPoint currentTick = new XYDataPoint();
            currentTick.setX(currentMillis);
            currentTick.setY(null);
            long aggregatedValue = 0;
            int numStatsInCurrentTick = 0;

            for (int i = 0; i < numTicksInResolution; i++) {
                long gmtMillis = currentMillis - (offsetMiutes * 60 * 1000);
                LiveStatistics currStat = liveHash.get(currentMillis);
                if (currStat == null) {
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

	public static XYDataSetCollection generateDataset(List<LiveStatistics> liveList, String seriesLabel, Alert alert, Date showChartFrom, Date showChartTo, int chartResolution) {
		XYDataSetCollection valueCollection = new XYDataSetCollection();
		XYDataList valueList = new XYDataList();
		valueList.setLabel(seriesLabel);
		valueList.setFillLines(true);
		valueList.setShowDataPoints(true);

		Hashtable<Long, LiveStatistics> liveHash = new Hashtable<Long, LiveStatistics>();
		for (LiveStatistics l : liveList) {
			liveHash.put(l.getPk().getTimeperiod() * 15000, l);
			// System.out.println("putting livestat in hash: " +
			// l.getTimestamp().getTime() + " : " + l.toString());
		}

		int offsetMiutes = showChartTo.getTimezoneOffset(); //number of minutes offset from GMT// Timstamps for the last 8 minutes

		//Get milliseconds from 1/1/1970 GMT+0
		Long millisNow = showChartTo.getTime();
		Long millisThen = showChartFrom.getTime();
		log.debug("generating chart from: " + showChartFrom + " (" + showChartFrom.getTime() + ")  to: " + showChartTo + " (" + showChartTo.getTime() + ")");

		//Round down to nearest 15 seconds timeperiod
		millisNow = millisNow - 15000 - (millisNow % 15000);
		millisThen = millisThen - (millisThen % 15000) + 15000;

		LiveStatistics currStat = null;
		long numStatsPerChartTick = (chartResolution * 1000) / 15000;
		long numStatsInCurrTick = -0;
		//Loop over all stats for each 15 second period
		for (Long i = millisThen; i <= millisNow; i += 15000) {
			++numStatsInCurrTick;
			LiveStatistics l = liveHash.get(i);
			if (l != null) {
				if (currStat == null) {
					//First iteration, or new chart tick
					currStat = new LiveStatistics();
					currStat.setValue(l.getValue());
				} else  {
					if (l.getValue() != null) {
						Long totalValue = currStat.getValue() * (numStatsInCurrTick - 1);
						totalValue += l.getValue();
						currStat.setValue(totalValue / numStatsInCurrTick);
					}
				}

				if (numStatsInCurrTick >= numStatsPerChartTick) {
					//place currStat in chart, set currStat to null
					long gmtMillis = i - (offsetMiutes * 60 * 1000);
					if (currStat.getValue() != null) {
						valueList.addDataPoint(new XYDataPoint(gmtMillis, currStat.getValue()));
					} else {
						valueList.addDataPoint(new XYDataPoint(gmtMillis, new Double(0)));
					}

					currStat = null;
					numStatsInCurrTick = -0;
				}
			}

		}

		if (liveList != null && liveList.size() > 0) {
			LiveStatistics ls = liveList.get(0);

			valueCollection.addDataList(valueList);
			if (alert != null && alert.isActivated() &&alert.getAlertOn() == Alert.ALERT_ON_VALUE) {
				valueCollection.addDataList(buildWarningList(alert, Alert.WARNING, getMinXAxis(showChartFrom), getMaxXAxis(showChartTo)));
				valueCollection.addDataList(buildWarningList(alert, Alert.CRITICAL, getMinXAxis(showChartFrom), getMaxXAxis(showChartTo)));
			}
		}

		return valueCollection;
	}
	
	private static XYDataList buildWarningList(Alert alert, int warningType, long minXaxis, long maxXaxis) {
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
	
	public static Long getMinXAxis(Date showChartFrom) {
		Long retVal = showChartFrom.getTime();
		if (retVal != null) {
			int offsetMiutes = showChartFrom.getTimezoneOffset(); //number of minutes offset from GMT// Timstamps for the last 8 minutes
			retVal -= (offsetMiutes * 60 * 1000);
		}
		
		return retVal;
	}
	
	public static Long getMaxXAxis(Date showChartTo) {
		Long retVal = showChartTo.getTime();
		if (retVal != null) {
			int offsetMiutes = showChartTo.getTimezoneOffset(); //number of minutes offset from GMT// Timstamps for the last 8 minutes
			retVal -= (offsetMiutes * 60 * 1000) + 15000;
		}
		
		return retVal;
	}
}
