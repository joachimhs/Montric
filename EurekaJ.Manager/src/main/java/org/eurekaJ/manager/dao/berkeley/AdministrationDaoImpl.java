package org.eurekaJ.manager.dao.berkeley;

import java.util.ArrayList;
import java.util.List;

import org.eurekaJ.manager.berkeley.BerkeleyDbEnv;
import org.eurekaJ.manager.berkley.administration.EmailSender;
import org.eurekaJ.manager.berkley.administration.EmailServer;

import com.sleepycat.persist.EntityCursor;
import com.sleepycat.persist.PrimaryIndex;

public class AdministrationDaoImpl implements AdministrationDao {
	private BerkeleyDbEnv dbEnvironment;
	private PrimaryIndex<String, EmailServer> emailServerPrimaryIdx;
	private PrimaryIndex<String, EmailSender> emailSenderPrimaryIdx;
	
	public AdministrationDaoImpl() {

	}
	
	public void setDbEnvironment(BerkeleyDbEnv dbEnvironment) {
		this.dbEnvironment = dbEnvironment;
		emailServerPrimaryIdx = this.dbEnvironment.getSmtpServerStore().getPrimaryIndex(String.class, EmailServer.class);
		emailSenderPrimaryIdx = this.dbEnvironment.getEmailSenderStore().getPrimaryIndex(String.class, EmailSender.class);
	}
	
	public List<EmailServer> getEmailServers() {
		List<EmailServer> retList = new ArrayList<EmailServer>();
		EntityCursor<EmailServer> pi_cursor = emailServerPrimaryIdx.entities();
		try {
		    for (EmailServer node : pi_cursor) {
		        retList.add(node);
		    }
		// Always make sure the cursor is closed when we are done with it.
		} finally {
			pi_cursor.close();
		} 
		return retList;
	}
	
	public EmailServer getEmailServer(String servername) {
		EmailServer server = emailServerPrimaryIdx.get(servername);
		return server;
	}
	
	public void persistEmailServer(EmailServer emailServer) {
		emailServerPrimaryIdx.put(emailServer);
	}
	
	public List<EmailSender> getEmailSenders() {
		List<EmailSender> retList = new ArrayList<EmailSender>();
		EntityCursor<EmailSender> pi_cursor = emailSenderPrimaryIdx.entities();
		try {
		    for (EmailSender node : pi_cursor) {
		        retList.add(node);
		    }
		// Always make sure the cursor is closed when we are done with it.
		} finally {
			pi_cursor.close();
		} 
		return retList;
	}
	
	public EmailSender getEmailSender(String senderName) {
		EmailSender server = emailSenderPrimaryIdx.get(senderName);
		return server;
	}
	
	public void persistEmailSender(EmailSender emailSender) {
		emailSenderPrimaryIdx.put(emailSender);
	}
		
}
