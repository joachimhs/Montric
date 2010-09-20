package org.eurekaJ.manager.managed;

import java.util.ArrayList;
import java.util.List;

import javax.faces.event.ActionEvent;
import javax.faces.model.DataModel;
import javax.faces.model.ListDataModel;
import javax.faces.model.SelectItem;

import org.eurekaJ.manager.berkley.administration.EmailSender;
import org.eurekaJ.manager.berkley.administration.EmailServer;
import org.eurekaJ.manager.service.AdministrationService;

public class AdministrationMBean implements AlertableMBean{
	private AdministrationService administrationService;
	
	private DataModel emailDataModel = new ListDataModel();
	private DataModel emailSenderDataModel = new ListDataModel();
	
	private List<EmailServer> selectedEmailServer;
	private EmailServer newEmailServer = new EmailServer();
	private EmailSender newEmailSender = new EmailSender();
	private EmailSender editEmailSender;
	private String newEmailAddress;
	
	public AdministrationMBean() {
		super();
	}
	
	public AdministrationService getAdministrationService() {
		return administrationService;
	}
	
	public void setAdministrationService(
			AdministrationService administrationService) {
		this.administrationService = administrationService;
	}
	
	public EmailServer getNewEmailServer() {
		return newEmailServer;
	}
	
	public DataModel getEmailServers() {
		List<EmailServer> emailServerList = administrationService.getEmailServers();
		emailDataModel.setWrappedData(emailServerList);
		return emailDataModel;
	}
	
	public List<SelectItem> getEmailServerItems() {
		List<SelectItem> itemList = new ArrayList<SelectItem>();
		for (EmailServer server : administrationService.getEmailServers()) {
			itemList.add(new SelectItem(server.getSmtpServer(), server.getSmtpServer()));
		}
		
		return itemList;
	}
	
	public void resetNewEmailForm(ActionEvent event) {
		newEmailServer = new EmailServer();
		
	}
	public void editEmailServer(ActionEvent event) {
		newEmailServer = (EmailServer)emailDataModel.getRowData();
		if (newEmailServer == null) {
			newEmailServer = new EmailServer();
		}
	}
	
	public void persistNewEmailServer(ActionEvent event) {
		administrationService.persistEmailServer(newEmailServer);
		newEmailServer = new EmailServer();
	}
	
	public DataModel getEmailSenders() {
		List<EmailSender> emailSenderList = administrationService.getEmailSenders();
		emailSenderDataModel.setWrappedData(emailSenderList);
		return emailSenderDataModel;
	}
	
	public EmailSender getNewEmailSender() {
		return newEmailSender;
	}
	
	public List<SelectItem> getEmailSenderItems() {
		List<SelectItem> itemList = new ArrayList<SelectItem>();
		for (EmailSender sender : administrationService.getEmailSenders()) {
			itemList.add(new SelectItem(sender.getEmailSenderName(), sender.getEmailSenderName()));
		}
		
		return itemList;
	}
	
	public void persistNewEmailSender(ActionEvent event) {
		administrationService.persistEmailSender(newEmailSender);
		newEmailSender = new EmailSender();
	}
	
	public EmailSender getEditEmailSender() {
		return editEmailSender;
	}
	
	public void setEditEmailSender(EmailSender editEmailSender) {
		this.editEmailSender = editEmailSender;
	}
	
	public void addEmailAddresses(ActionEvent event) {
		EmailSender sender = (EmailSender)emailSenderDataModel.getRowData();
		if (sender != null) {
			editEmailSender = sender;
		}
	}
	
	public boolean isEditEmailSenderSelected() {
		return editEmailSender != null;
	}
	
	public String getNewEmailAddress() {
		return newEmailAddress;
	}
	
	public void setNewEmailAddress(String newEmailAddress) {
		this.newEmailAddress = newEmailAddress;
	}
	
	public void saveNewEmailAddress(ActionEvent event) {
		if (newEmailAddress != null && editEmailSender != null) {
			if (editEmailSender.getEmailReceivers() == null) {
				editEmailSender.setEmailReceivers(new ArrayList<String>());
			}
			editEmailSender.getEmailReceivers().add(newEmailAddress);
		}
		administrationService.persistEmailSender(editEmailSender);
		newEmailAddress = null;
	}
	
	@Override
	public void processPathChange() {
		//Nothing to do. 		
	}
}
