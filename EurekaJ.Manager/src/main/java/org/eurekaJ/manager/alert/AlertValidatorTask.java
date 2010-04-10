package org.eurekaJ.manager.alert;

import java.util.Calendar;
import java.util.List;

import org.eurekaJ.manager.berkeley.statistics.LiveStatistics;
import org.eurekaJ.manager.perst.alert.Alert;
import org.eurekaJ.manager.service.TreeMenuService;

public class AlertValidatorTask {
	private TreeMenuService treeMenuService;
	
	public TreeMenuService getTreeMenuService() {
		return treeMenuService;
	}
	
	public void setTreeMenuService(TreeMenuService treeMenuService) {
		this.treeMenuService = treeMenuService;
	}
	
	public void evaluateAlerts() {
		//Get all alerts
		List<Alert> alertList = treeMenuService.getAlerts();
		
		//For Each active alert
		for (Alert alert : alertList) {
			if (alert.isActivated()) {
				int oldStatus = alert.getStatus();
				List<LiveStatistics> statList = getStatistic(alert.getGuiPath(), alert.getAlertDelay());
				//Get statistics and evaluate alert condition
				alert.setStatus(evaluateStatistics(alert, statList));
				if (oldStatus != alert.getStatus()) {
					System.out.println("\t\tAlert: " + alert.getGuiPath() + " Has changed status to: " + alert.getStatusString());
					treeMenuService.persistAlert(alert);
				} else {
					System.out.println("\t\tAlert: " + alert.getGuiPath() + " Remains at status: " + alert.getStatusString());
				}
			}
		}	
	}
	
	public int evaluateStatistics(Alert alert, List<LiveStatistics> statList) {
		if (statList == null || statList.size() == 0) {
			//Statistics is Idle == Not Reporting data to Manager
			return Alert.IDLE;
		} else if (thresholdBreached(statList, alert.getAlertOn(), alert.getErrorValue(), alert.getSelectedAlertType())) {
			//Critical Threshold Breached
			return Alert.CRITICAL;
		} else if (thresholdBreached(statList, alert.getAlertOn(), alert.getWarningValue(), alert.getSelectedAlertType())) {
			//Warning Threshold Breached
			return Alert.WARNING;
		} else { 
			//OK
			return Alert.NORMAL;
		}
	}
	
	public boolean thresholdBreached(List<LiveStatistics> statList, int alertOn, double threshold, int alertType) {
        boolean thresholdBreached = true;
		for (LiveStatistics stat : statList) {
			Double statThreshold = null;
			if (alertOn == Alert.ALERT_ON_AVG_EXECTIME) {
				statThreshold = stat.getAvgExecutionTime();
			} else if (alertOn == Alert.ALERT_ON_TOTAL_EXECTIME) {
				statThreshold = stat.getTotalExecutionTimeMillis();
			} else if (alertOn == Alert.ALERT_ON_CALLS) {
				Long calls = stat.getCallsPerInterval();
				if (calls != null) {
					statThreshold = calls.doubleValue();
				}
			} else if (alertOn == Alert.ALERT_ON_VALUE) {
				Long value = stat.getValue();
				if (value != null) {
					statThreshold = value.doubleValue();
				}
			}
			
			if (alertType == Alert.GREATER_THAN && statThreshold != null && statThreshold  <= threshold) {
				thresholdBreached = false;
				break;
			} else if (alertType == Alert.EQUALS && statThreshold != null && statThreshold == threshold) {
				thresholdBreached = false;
				break;
			} else if (alertType == Alert.LESS_THAN && statThreshold != null && statThreshold > threshold) {
				thresholdBreached = false;
				break;
			}
		}
		
		return thresholdBreached;
	}
	
	public List<LiveStatistics> getStatistic(String guiPath, long timeperiods) {
		if (timeperiods <= 0) {
			timeperiods = 1;
		}
		
		Long millisNow = Calendar.getInstance().getTimeInMillis();
		millisNow = (millisNow / 15000) -1;
		Long millisThen = millisNow - timeperiods;
		//System.out.println("Getting stats from: " + millisThen + " to: " + millisNow);
		
		return treeMenuService.getLiveStatistics(guiPath, millisThen, millisNow);
	}

}
