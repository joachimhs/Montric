package org.eurekaj.manager.task;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.List;

import org.eurekaj.manager.berkeley.statistics.LiveStatistics;
import org.eurekaj.manager.berkley.administration.EmailRecipientGroup;
import org.eurekaj.manager.perst.alert.Alert;
import org.eurekaj.manager.service.AdministrationService;
import org.eurekaj.manager.service.TreeMenuService;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

public class AlertValidatorTask {
	private TreeMenuService treeMenuService;
	private AdministrationService administrationService;
	private ThreadPoolTaskExecutor sendEmailExecutor;
	private SimpleDateFormat dateFormat;
	
	public AlertValidatorTask() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss.SSS");
	}
	
	public TreeMenuService getTreeMenuService() {
		return treeMenuService;
	}
	
	public void setTreeMenuService(TreeMenuService treeMenuService) {
		this.treeMenuService = treeMenuService;
	}
	
	public ThreadPoolTaskExecutor getSendEmailExecutor() {
		return sendEmailExecutor;
	}
	
	public void setSendEmailExecutor(ThreadPoolTaskExecutor sendEmailExecutor) {
		this.sendEmailExecutor = sendEmailExecutor;
	}
	
	public AdministrationService getAdministrationService() {
		return administrationService;
	}
	
	public void setAdministrationService(
			AdministrationService administrationService) {
		this.administrationService = administrationService;
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
					Calendar cal = Calendar.getInstance();
					for (String emailGroup : alert.getSelectedEmailSenderList()) {
						EmailRecipientGroup emailRecipientGroup = administrationService.getEmailRecipientGroup(emailGroup);
						if (emailRecipientGroup != null) {
							SendEmailTask sendEmailTask = new SendEmailTask(emailRecipientGroup, alert, oldStatus, statList.get(statList.size() - 1).getValue(), dateFormat.format(cal.getTime()));
							sendEmailExecutor.execute(sendEmailTask);
						}
					}
					
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
			Long value = stat.getValue();
            if (value != null) {
                statThreshold = value.doubleValue();
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
