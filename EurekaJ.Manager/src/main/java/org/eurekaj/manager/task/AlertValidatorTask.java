package org.eurekaj.manager.task;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.List;

import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.datatypes.EmailRecipientGroup;
import org.eurekaj.api.datatypes.LiveStatistics;
import org.eurekaj.api.datatypes.TriggeredAlert;
import org.eurekaj.api.enumtypes.AlertStatus;
import org.eurekaj.api.enumtypes.AlertType;
import org.eurekaj.manager.datatypes.ManagerAlert;
import org.eurekaj.manager.datatypes.ManagerTriggeredAlert;
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
				AlertStatus oldStatus = alert.getStatus();
				List<LiveStatistics> statList = getStatistic(alert.getGuiPath(), alert.getAlertDelay());
				//Get statistics and evaluate alert condition
				AlertStatus newStatus = evaluateStatistics(alert, statList);
				if (oldStatus != newStatus) {
                    //Status have changed, store new triggeredAlert and send email

                    ManagerTriggeredAlert managerTriggeredAlert = new ManagerTriggeredAlert(
                            alert.getAlertName(),
                            statList.get(statList.size() -1).getTimeperiod(),
                            alert.getErrorValue(),
                            alert.getWarningValue(),
                            statList.get(statList.size() - 1).getValue(),
                            statList.get(statList.size() -1).getTimeperiod()

                    );

                    treeMenuService.persistTriggeredAlert(managerTriggeredAlert);

					Calendar cal = Calendar.getInstance();
					for (String emailGroup : alert.getSelectedEmailSenderList()) {
						EmailRecipientGroup emailRecipientGroup = administrationService.getEmailRecipientGroup(emailGroup);
						if (emailRecipientGroup != null) {
                            //public SendEmailTask(BerkeleyEmailRecipientGroup emailRecipientGroup, BerkeleyAlert alert, int oldStatus, long currValue, String timeString) {)
							SendEmailTask sendEmailTask = new SendEmailTask(emailRecipientGroup, alert, oldStatus, statList.get(statList.size() - 1).getValue(), dateFormat.format(cal.getTime()));
							sendEmailExecutor.execute(sendEmailTask);
						}
					}

                    ManagerAlert newAlert = new ManagerAlert(alert);
                    newAlert.setStatus(newStatus);
					treeMenuService.persistAlert(newAlert);
				} else {
					System.out.println("\t\tBerkeleyAlert: " + alert.getGuiPath() + " Remains at status: " + alert.getStatus().getStatusName());
				}
			}
		}	
	}
	
	public AlertStatus evaluateStatistics(Alert alert, List<LiveStatistics> statList) {
		if (statList == null || statList.size() == 0) {
			//Statistics is Idle == Not Reporting data to Manager
			return AlertStatus.IDLE;
		} else if (thresholdBreached(statList, alert.getErrorValue(), alert.getSelectedAlertType())) {
			//Critical Threshold Breached
			return AlertStatus.CRITICAL;
		} else if (thresholdBreached(statList, alert.getWarningValue(), alert.getSelectedAlertType())) {
			//Warning Threshold Breached
			return AlertStatus.WARNING;
		} else { 
			//OK
			return AlertStatus.NORMAL;
		}
	}
	
	public boolean thresholdBreached(List<LiveStatistics> statList, double threshold, AlertType alertType) {
        boolean thresholdBreached = true;
		for (LiveStatistics stat : statList) {
			Double statThreshold = null;
			Double value = stat.getValue();
            if (value != null) {
                statThreshold = value.doubleValue();
            }

			
			if (alertType == AlertType.GREATER_THAN && statThreshold != null && statThreshold  <= threshold) {
				thresholdBreached = false;
				break;
			} else if (alertType == AlertType.EQUALS && statThreshold != null && statThreshold == threshold) {
				thresholdBreached = false;
				break;
			} else if (alertType == AlertType.LESS_THAN && statThreshold != null && statThreshold > threshold) {
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
