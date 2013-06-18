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
package org.eurekaj.manager.task;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.ThreadPoolExecutor;

import org.apache.log4j.Logger;
import org.eurekaj.api.dao.AlertEvaluationQueueDao;
import org.eurekaj.api.datatypes.Account;
import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.datatypes.EmailRecipientGroup;
import org.eurekaj.api.datatypes.LiveStatistics;
import org.eurekaj.api.enumtypes.AlertStatus;
import org.eurekaj.api.enumtypes.AlertType;
import org.eurekaj.api.util.ListToString;
import org.eurekaj.manager.datatypes.ManagerAlert;
import org.eurekaj.manager.datatypes.ManagerTriggeredAlert;
import org.eurekaj.manager.plugin.ManagerAlertPluginService;
import org.eurekaj.manager.plugin.ManagerDbPluginService;
import org.eurekaj.manager.service.AccountService;
import org.eurekaj.manager.service.AdministrationService;
import org.eurekaj.manager.service.TreeMenuService;
import org.eurekaj.manager.util.DatabasePluginUtil;
import org.eurekaj.manager.util.PropertyUtil;
import org.eurekaj.spi.db.EurekaJDBPluginService;

public class GenerateNewAlertEvaluationQueue implements Runnable {
	private static final Logger log = Logger.getLogger(GenerateNewAlertEvaluationQueue.class);
	private TreeMenuService treeMenuService;
	private AdministrationService administrationService;
	private AccountService accountService;
	private ThreadPoolExecutor sendEmailExecutor;
	private SimpleDateFormat dateFormat;
	private EurekaJDBPluginService dbPlugin;
	
	public GenerateNewAlertEvaluationQueue() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss.SSS");
		dbPlugin = ManagerDbPluginService.getInstance().getPluginServiceWithName(DatabasePluginUtil.getDatabasePluginName());
	}
	
	public TreeMenuService getTreeMenuService() {
		return treeMenuService;
	}
	
	public void setTreeMenuService(TreeMenuService treeMenuService) {
		this.treeMenuService = treeMenuService;
	}
	
	public ThreadPoolExecutor getSendEmailExecutor() {
		return sendEmailExecutor;
	}
	
	public void setSendEmailExecutor(ThreadPoolExecutor sendEmailExecutor) {
		this.sendEmailExecutor = sendEmailExecutor;
	}
	
	public AdministrationService getAdministrationService() {
		return administrationService;
	}
	
	public AccountService getAccountService() {
		return accountService;
	}
	
	public void setAccountService(AccountService accountService) {
		this.accountService = accountService;
	}
	
	public void setAdministrationService(
			AdministrationService administrationService) {
		this.administrationService = administrationService;
	}
	
	public void run() {
		log.info("Running GenerateNewAlertEvaluationQueue");
		AlertEvaluationQueueDao alertEvaluationQueueDao = dbPlugin.getAlertEvaluationQueueDao();
		
		long evaluationThreshold = System.currentTimeMillis() - 15000;
		
		List<Account> accountListForEvaluation = new ArrayList<>();
		for (Account account : dbPlugin.getAccountDao().getAccounts()) {
			log.info("Testing to see if account " + account.getId() + " needs to be evaluated");
			if (account.getLastEvaluatedForAlerts() == null || account.getLastEvaluatedForAlerts() < evaluationThreshold) {
				log.info("Adding " + account.getId() + " to new queue");
				accountListForEvaluation.add(account);
			}
		}		
		
		alertEvaluationQueueDao.addAccountsToNewQueue(accountListForEvaluation);
	}
	
	/*
		for (Account account : accountService.getAccounts()) {
			//Get all alerts
			List<Alert> alertList = treeMenuService.getAlerts(account.getId());
			
			//For Each active alert
			for (Alert alert : alertList) {
				if (alert.isActivated()) {
					AlertStatus oldStatus = alert.getStatus();
					List<LiveStatistics> statList = getStatistic(alert.getGuiPath(), alert.getAlertDelay(), account.getId());
					//Get statistics and evaluate alert condition
					AlertStatus newStatus = evaluateStatistics(alert, statList);
					if (oldStatus != newStatus && statList.size() >= 1) {
	                    //Status have changed, store new triggeredAlert and send email
						ManagerAlert newAlert = new ManagerAlert(alert);
	                    newAlert.setStatus(newStatus);
	                    treeMenuService.persistAlert(newAlert);
	                    
	                    ManagerTriggeredAlert managerTriggeredAlert = new ManagerTriggeredAlert(
	                            alert.getAlertName(),
	                            alert.getAccountName(),
	                            statList.get(statList.size() -1).getTimeperiod(),
	                            alert.getErrorValue(),
	                            alert.getWarningValue(),
	                            statList.get(statList.size() - 1).getValue(),
	                            statList.get(statList.size() -1).getTimeperiod()

	                    );

	                    treeMenuService.persistTriggeredAlert(managerTriggeredAlert);

						Calendar cal = Calendar.getInstance();
						/*for (String emailGroup : alert.getSelectedEmailSenderList()) {
							EmailRecipientGroup emailRecipientGroup = administrationService.getEmailRecipientGroup(emailGroup, alert.getAccountName());
							if (emailRecipientGroup != null) {
								log.debug("\t\tAlert: " + alert.getGuiPath() + " changed to status: " + alert.getStatus().getStatusName() + ". Invoking email plugin.");
								//The email alert is special, as properties needs to be built up for each alert being sent. 

								log.debug("statList: " + statList);
								log.debug("dateFormat: " + dateFormat);
								log.debug("newValue: " + statList.get(statList.size() - 1));
								
								double currvalue = 0d;
								if (statList.get(statList.size() - 1).getValue() != null) {
									currvalue = statList.get(statList.size() - 1).getValue();
								}
								//ManagerAlertPluginService.getInstance().sendAlert("alertEmailPlugin", alertProperties, newAlert, oldStatus, currvalue, dateFormat.format(cal.getTime()));
							}
						}*/
						
						/*for (String pluginName : alert.getSelectedAlertPluginList()) {
							log.debug("\t\tAlert through plugin: " + alert.getGuiPath() + " changed to status: " + alert.getStatus().getStatusName() + ". Invoking alert plugin.");
							//TODO: Figure out which plugin to send the alert to.
							//Properties alertProperties = PropertyUtil.extractPropertiesStartingWith("org.eurekaj.plugin.alert.", System.getProperties());
							double currvalue = 0d;
							if (statList.get(statList.size() - 1).getValue() != null) {
								currvalue = statList.get(statList.size() - 1).getValue();
							}
							
							
							ManagerAlertPluginService.getInstance().sendAlert(pluginName, alertProperties, newAlert, oldStatus, currvalue, dateFormat.format(cal.getTime()));
						}

					} else {
						log.debug("\t\tAlert: " + alert.getGuiPath() + " Remains at status: " + alert.getStatus().getStatusName());
					}
				}
			}	
		}
	}*/
	
	

}
