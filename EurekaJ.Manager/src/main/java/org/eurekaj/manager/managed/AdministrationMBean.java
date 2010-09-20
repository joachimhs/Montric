package org.eurekaj.manager.managed;

import java.util.ArrayList;
import java.util.List;

import javax.faces.event.ActionEvent;
import javax.faces.model.DataModel;
import javax.faces.model.ListDataModel;

import org.eurekaj.manager.berkley.administration.EmailRecipientGroup;
import org.eurekaj.manager.email.SendEmailTask;
import org.eurekaj.manager.perst.alert.Alert;
import org.eurekaj.manager.service.AdministrationService;

public class AdministrationMBean implements AlertableMBean {
	private AdministrationService administrationService;
	
	private DataModel emailGroupDataModel = new ListDataModel();
	private DataModel emailAddresses = new ListDataModel();
	private String newEmailGroupName;
	
	private EmailRecipientGroup newEmailRecipientGroup = new EmailRecipientGroup();
	private EmailRecipientGroup editEmailRecipientGroup;
	private String newEmailAddress;
	
	public AdministrationMBean() {
		super();
	}
	
	public String getNewEmailGroupName() {
		return newEmailGroupName;
	}
	
	public void setNewEmailGroupName(String newEmailGroupName) {
		this.newEmailGroupName = newEmailGroupName;
	}
	
	public AdministrationService getAdministrationService() {
		return administrationService;
	}
	
	public void setAdministrationService(
			AdministrationService administrationService) {
		this.administrationService = administrationService;
	}
	
	public EmailRecipientGroup getNewEmailRecipientGroup() {
		return newEmailRecipientGroup;
	}
	
	public EmailRecipientGroup getEditEmailRecipientGroup() {
		return editEmailRecipientGroup;
	}
	
	public DataModel getEmailRecipientGroups() {
		List<EmailRecipientGroup> emailServerList = administrationService.getEmailRecipientGroups();
		emailGroupDataModel.setWrappedData(emailServerList);
		return emailGroupDataModel;
	}
	
	public DataModel getEmailAddresses() {
		return emailAddresses;
	}
		
	public void editEmailRecipientGroupAction(ActionEvent event) {
		editEmailRecipientGroup = (EmailRecipientGroup)emailGroupDataModel.getRowData();
		if (editEmailRecipientGroup == null) {
			editEmailRecipientGroup = new EmailRecipientGroup();
			editEmailRecipientGroup.setEmailRecipientGroupName("Unknown Group");
		}
		emailAddresses.setWrappedData(editEmailRecipientGroup.getEmailRecipientList());
	}
	
	public void deleteEmailRecipientGroupAction(ActionEvent event) {
		EmailRecipientGroup group = (EmailRecipientGroup)emailGroupDataModel.getRowData();
		administrationService.deleteEmailRecipientGroup(group);
		getEmailRecipientGroups();
	}
	
	public void saveEmailRecipientGroupAction(ActionEvent event) {
		administrationService.persistEmailRecipientGroup(editEmailRecipientGroup);
	}
	
	public void deleteEmailAddress(ActionEvent event) {
		String emailAddress = (String)emailAddresses.getRowData();
		int index = -1;
		if (emailAddress != null && (index = editEmailRecipientGroup.getEmailRecipientList().indexOf(emailAddress)) >= 0) {
			editEmailRecipientGroup.getEmailRecipientList().remove(index);
		}
		
		administrationService.persistEmailRecipientGroup(editEmailRecipientGroup);
		emailAddresses.setWrappedData(editEmailRecipientGroup.getEmailRecipientList());
	}
	
	public void saveNewEmailAddress(ActionEvent event) {
		if (newEmailAddress != null && !editEmailRecipientGroup.getEmailRecipientList().contains(newEmailAddress)) {
			editEmailRecipientGroup.getEmailRecipientList().add(newEmailAddress);
		}
		
		emailAddresses.setWrappedData(editEmailRecipientGroup.getEmailRecipientList());
		
		administrationService.persistEmailRecipientGroup(editEmailRecipientGroup);
		
		newEmailAddress = "";
	}
	
	
	public void createNewEmailGroupName(ActionEvent event) {
		newEmailRecipientGroup = new EmailRecipientGroup();
		newEmailRecipientGroup.setEmailRecipientGroupName(newEmailGroupName);
		administrationService.persistEmailRecipientGroup(newEmailRecipientGroup);
		newEmailGroupName = "";
	}
	
	public void testEmilGroupAction(ActionEvent evetn) {
		Alert a = new Alert();
		a.setGuiPath("Test Alert");
		a.setAlertDelay(2);
		a.setAlertOn(Alert.ALERT_ON_VALUE);
		a.setErrorValue(0d);
		a.setWarningValue(0d);
		a.setStatus(-1);
		SendEmailTask emailTask = new SendEmailTask(editEmailRecipientGroup, a, -1, 0, "Email Recipient Group Test");
		new Thread(emailTask).start();
	}
	
	public String getNewEmailAddress() {
		return newEmailAddress;
	}
	
	public void setNewEmailAddress(String newEmailAddress) {
		this.newEmailAddress = newEmailAddress;
	}
	
	
	@Override
	public void processPathChange() {
		//Nothing to do. 		
	}
}
