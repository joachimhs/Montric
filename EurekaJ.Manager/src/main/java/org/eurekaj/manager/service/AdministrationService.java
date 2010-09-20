package org.eurekaJ.manager.service;

import java.util.List;

import org.eurekaJ.manager.berkley.administration.EmailSender;
import org.eurekaJ.manager.berkley.administration.EmailServer;

public interface AdministrationService {

	public List<EmailServer> getEmailServers();
	
	public EmailServer getEmailServer(String servername);
	
	public void persistEmailServer(EmailServer emailServer);
	
	public List<EmailSender> getEmailSenders();
	
	public EmailSender getEmailSender(String senderName);
	
	public void persistEmailSender(EmailSender emailSender);
}
