package org.eurekaj.manager.managed;

import java.util.ArrayList;
import java.util.List;

import javax.faces.event.ActionEvent;
import javax.faces.model.SelectItem;

import org.eurekaj.manager.berkeley.treemenu.TreeMenuNode;
import org.eurekaj.manager.berkley.administration.EmailRecipientGroup;
import org.eurekaj.manager.perst.alert.Alert;
import org.eurekaj.manager.service.AdministrationService;
import org.eurekaj.manager.service.TreeMenuService;

public class AlertMBean implements AlertableMBean {
	private UserMBean userMBean;
	private TreeMenuService treeMenuService;
	private AdministrationService administrationService;
	private TreeMenuNode selectedTreeMenuNode;
	private List<SelectItem> alertTypes;
	private List<SelectItem> alertOnTypes;
	private Alert alert;
	private List<SelectItem> availableEmailSenderList;
	private List<String> selectedEmailSenderList;
	
	public AlertMBean() {
		alertTypes = new ArrayList<SelectItem>();
		alertTypes.add(new SelectItem(Alert.GREATER_THAN, "Greater Than"));
		alertTypes.add(new SelectItem(Alert.LESS_THAN, "Less Than"));
		alertTypes.add(new SelectItem(Alert.EQUALS, "Equals"));
		
		alertOnTypes = new ArrayList<SelectItem>();
		
		availableEmailSenderList = new ArrayList<SelectItem>();
	}
	
	public UserMBean getUserMBean() {
		return userMBean;
	}
	
	public void setUserMBean(UserMBean userMBean) {
		this.userMBean = userMBean;
		this.userMBean.addMBeanToAlertList(this);
	}
	
	public TreeMenuService getTreeMenuService() {
		return treeMenuService;
	}
	
	public void setTreeMenuService(TreeMenuService treeMenuService) {
		this.treeMenuService = treeMenuService;
	}
	
	public AdministrationService getAdministrationService() {
		return administrationService;
	}
	
	public void setAdministrationService(
			AdministrationService administrationService) {
		this.administrationService = administrationService;
	}
		
	public TreeMenuNode getSelectedTreeMenuNode() {
		return selectedTreeMenuNode;
	}
	
	public List<SelectItem> getAlertTypes() {
		return alertTypes;
	}
	
	public void setAlertTypes(List<SelectItem> alertTypes) {
		this.alertTypes = alertTypes;
	}
	
	public List<SelectItem> getAlertOnTypes() {
		return alertOnTypes;
	}
	
	public void setAlertOnTypes(List<SelectItem> alertOnTypes) {
		this.alertOnTypes = alertOnTypes;
	}
	
	public Alert getAlert() {
		return alert;
	}
	
	public void setAlert(Alert alert) {
		this.alert = alert;
	} 
	
	public void saveAlert(ActionEvent event) {
		List<String> emails = new ArrayList<String>();
		
		for (String email : selectedEmailSenderList) {
			emails.add(email);
		}
		
		this.alert.setSelectedEmailSenderList(emails);
		treeMenuService.persistAlert(this.alert);
	}
	
	public boolean isNodeAlertable() {
		return selectedTreeMenuNode != null;
	}
	
	public List<SelectItem> getAvailableEmailSenderList() {
		return availableEmailSenderList;
	}
	
	public void setAvailableEmailSenderList(
			List<SelectItem> availableEmailSenderList) {
		this.availableEmailSenderList = availableEmailSenderList;
	}
	
	public void navigateToTab(ActionEvent event) {
		updateModelAfterPathChange();
	}
	
	public List<String> getSelectedEmailSenderList() {
		return selectedEmailSenderList;
	}
	
	public void setSelectedEmailSenderList(List<String> selectedEmailSenderList) {
		this.selectedEmailSenderList = selectedEmailSenderList;
	}
	
	private void updateModelAfterPathChange() {
		String selectedPath = userMBean.getSelectedPath();
		selectedTreeMenuNode = treeMenuService.getTreeMenu(selectedPath);
		if (selectedTreeMenuNode != null) {
			alertOnTypes = new ArrayList<SelectItem>();
			if (selectedTreeMenuNode.isHasExecTimeInformation()) {
				alertOnTypes.add(new SelectItem(Alert.ALERT_ON_AVG_EXECTIME, "Average Execution Time"));
				alertOnTypes.add(new SelectItem(Alert.ALERT_ON_TOTAL_EXECTIME, "Total Execution Time"));
			}
			
			if (selectedTreeMenuNode.isHasCallsPerIntervalInformation()) {
				alertOnTypes.add(new SelectItem(Alert.ALERT_ON_CALLS, "Calls Per Interval"));
			}
			
			if (selectedTreeMenuNode.isHasValueInformation()) {
				alertOnTypes.add(new SelectItem(Alert.ALERT_ON_VALUE, "Value"));
			}
			
			Alert a = treeMenuService.getAlert(selectedPath);
			if (a != null) {
				this.alert = a;
			} else {
				this.alert = new Alert();
				this.alert.setGuiPath(selectedPath);
			}
		}
		
		availableEmailSenderList = new ArrayList<SelectItem>();
		selectedEmailSenderList = new ArrayList<String>();
		selectedEmailSenderList.addAll(this.alert.getSelectedEmailSenderList());
		List<EmailRecipientGroup> emailRecipientGroupList = administrationService.getEmailRecipientGroups();
		for (EmailRecipientGroup emailRecipientGroup : emailRecipientGroupList) {
			availableEmailSenderList.add(new SelectItem(emailRecipientGroup.getEmailRecipientGroupName(), emailRecipientGroup.getEmailRecipientGroupName()));
		}
		
		availableEmailSenderList.removeAll(selectedEmailSenderList);
	}
	
	@Override
	public void processPathChange() {
		updateModelAfterPathChange();
	}
	
}
