package org.eurekaJ.manager.dao.berkeley;

import java.util.List;

import org.eurekaJ.manager.berkley.administration.EmailSender;
import org.eurekaJ.manager.berkley.administration.EmailServer;

public interface AdministrationDao {

	public List<EmailServer> getEmailServers();
	
	public EmailServer getEmailServer(String servername);
	
	public void persistEmailServer(EmailServer emailServer);
	
	public List<EmailSender> getEmailSenders();
	
	public EmailSender getEmailSender(String senderName);
	
	public void persistEmailSender(EmailSender emailSender);
}
