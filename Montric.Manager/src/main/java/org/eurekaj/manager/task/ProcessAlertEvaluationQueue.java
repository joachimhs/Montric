package org.eurekaj.manager.task;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.datatypes.AlertRecipient;
import org.eurekaj.api.datatypes.LiveStatistics;
import org.eurekaj.api.datatypes.basic.BasicAccount;
import org.eurekaj.api.datatypes.basic.BasicAlert;
import org.eurekaj.api.datatypes.basic.BasicTriggeredAlert;
import org.eurekaj.api.datatypes.basic.IdObject;
import org.eurekaj.api.enumtypes.AlertStatus;
import org.eurekaj.api.enumtypes.AlertType;
import org.eurekaj.manager.plugin.ManagerAlertPluginService;
import org.eurekaj.manager.plugin.ManagerDbPluginService;
import org.eurekaj.manager.util.DatabasePluginUtil;
import org.eurekaj.spi.db.EurekaJDBPluginService;

public class ProcessAlertEvaluationQueue  implements Runnable {
	private Logger logger = Logger.getLogger(ProcessAlertEvaluationQueue.class.getName());
	private EurekaJDBPluginService dbPlugin;
	
	public ProcessAlertEvaluationQueue() {
		dbPlugin = ManagerDbPluginService.getInstance().getPluginServiceWithName(DatabasePluginUtil.getDatabasePluginName());
	}
	@Override
	public void run() {
		try {
			logger.info("Running ProcessAlertEvaluationQueue");
			String accountName = dbPlugin.getAlertEvaluationQueueDao().getNextAccountToEvaluateAndMarkAsEvaluating();
			while (accountName != null) {
				logger.info("Processing alerts for account " + accountName);
				BasicAccount account = new BasicAccount(dbPlugin.getAccountDao().getAccount(accountName));
				account.setLastEvaluatedForAlerts(System.currentTimeMillis());
				dbPlugin.getAccountDao().persistAccount(account);
				
				//Get alerts for account
				for (Alert alert : dbPlugin.getAlertDao().getAlerts(accountName)) {
					logger.info("Evaluating alert: " + alert.getAlertName() + " for account: " + alert.getAccountName());
					if (alert.isActivated()) {
						AlertStatus oldStatus = alert.getStatus();
						List<LiveStatistics> statList = getStatistic(alert.getGuiPath(), alert.getAlertDelay(), account.getId());
						//Get statistics and evaluate alert condition
						AlertStatus newStatus = evaluateStatistics(alert, statList);
						if (oldStatus != newStatus && statList.size() >= 1) {
		                    //Status have changed, store new triggeredAlert and send email
							logger.info("Alert status changed: " + newStatus.getStatusName() + " num plugins: " + alert.getSelectedEmailSenderList().size());
	
							for (String alertPluginId : alert.getSelectedEmailSenderList()) {
								AlertRecipient alertRecipient = dbPlugin.getAlertRecipientDao().getAlertRecipient(alert.getAccountName(), alertPluginId);
								List<String> recipients = new ArrayList<>();
								for (String idObject : alertRecipient.getRecipients()) {
									recipients.add(idObject);
								}
								
								logger.info("Sending alert through plugin: " + alertPluginId);
								
								ManagerAlertPluginService.getInstance().sendAlert(alertRecipient, recipients, alert, oldStatus, getCurrentValue(statList), "" + System.currentTimeMillis());
								
							}
							
							
							BasicTriggeredAlert triggeredAlert = new BasicTriggeredAlert();
							triggeredAlert.setAccountName(accountName);
							triggeredAlert.setAlertName(alert.getAlertName());
							triggeredAlert.setAlertValue(getCurrentValue(statList));
							triggeredAlert.setErrorValue(alert.getErrorValue());
							triggeredAlert.setTimeperiod(System.currentTimeMillis() / 15000);
							triggeredAlert.setWarningValue(alert.getWarningValue());
							logger.info("Persisitng triggered alert for alert: " + alert.getAlertName() + " for account: " + alert.getAccountName());
							
							dbPlugin.getAlertDao().persistTriggeredAlert(triggeredAlert);
							
							BasicAlert basicAlert = new BasicAlert(alert);
							basicAlert.setStatus(newStatus);
							logger.info("Persisitng new status for alert: " + basicAlert.getAlertName() + " for account: " + basicAlert.getAccountName() + " new status: " + basicAlert.getStatus().getStatusName());
							dbPlugin.getAlertDao().persistAlert(basicAlert);
						} else {
							logger.info("Alert status remains: " + newStatus.getStatusName());
						}
					} else {
						logger.info("Alert not active: " + alert.getAlertName());
					}
				}
				
				logger.info("Deleting account from Evaluation Queue: " + accountName);
				dbPlugin.getAlertEvaluationQueueDao().deleteAccountFromEvaluationQueue(accountName);
				accountName = dbPlugin.getAlertEvaluationQueueDao().getNextAccountToEvaluateAndMarkAsEvaluating();
			}	
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public Double getCurrentValue(List<LiveStatistics> statList) {
		Double currValue = null;
		
		if (statList.size() > 0) {
			currValue = statList.get(statList.size() - 1).getValue();
		}
		
		return currValue;
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
	
	public List<LiveStatistics> getStatistic(String guiPath, long timeperiods, String accountName) {
		if (timeperiods <= 0) {
			timeperiods = 1;
		}
		
		Long millisNow = Calendar.getInstance().getTimeInMillis();
		millisNow = (millisNow / 15000) -1;
		Long millisThen = millisNow - timeperiods;
		logger.debug("Getting stats from: " + millisThen + " to: " + millisNow);
		
		return dbPlugin.getLiveStatissticsDao().getLiveStatistics(guiPath, accountName, millisThen, millisNow);
	}
}
