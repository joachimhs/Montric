package org.eurekaJ.manager.service;

import java.util.List;

import org.eurekaJ.manager.berkley.administration.EmailSender;
import org.eurekaJ.manager.berkley.administration.EmailServer;
import org.eurekaJ.manager.dao.berkeley.AdministrationDao;

public class AdministrationServiceImpl implements AdministrationService {
	private AdministrationDao administrationDao;
	
	
	public AdministrationDao getAdministrationDao() {
		return administrationDao;
	}
	
	public void setAdministrationDao(AdministrationDao administrationDao) {
		this.administrationDao = administrationDao;
	}
	
	@Override
	public List<EmailServer> getEmailServers() {
		return administrationDao.getEmailServers();
	}
	
	@Override
	public EmailServer getEmailServer(String servername) {
		return administrationDao.getEmailServer(servername);
	}
	
	@Override
	public void persistEmailServer(EmailServer emailServer) {
		administrationDao.persistEmailServer(emailServer);		
	}
	
	@Override
	public List<EmailSender> getEmailSenders() {
		return administrationDao.getEmailSenders();
	}
	
	@Override
	public EmailSender getEmailSender(String senderName) {
		return administrationDao.getEmailSender(senderName);
	}
	
	@Override
	public void persistEmailSender(EmailSender emailSender) {
		administrationDao.persistEmailSender(emailSender);
	}
}
