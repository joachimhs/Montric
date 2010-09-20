package org.eurekaj.manager.dao.berkeley;

import java.util.ArrayList;
import java.util.List;

import org.eurekaj.manager.berkeley.BerkeleyDbEnv;
import org.eurekaj.manager.berkley.administration.EmailRecipientGroup;

import com.sleepycat.persist.EntityCursor;
import com.sleepycat.persist.PrimaryIndex;

public class AdministrationDaoImpl implements AdministrationDao {
	private BerkeleyDbEnv dbEnvironment;
	private PrimaryIndex<String, EmailRecipientGroup> emailRecipientGroupPrimaryIdx;
	
	public AdministrationDaoImpl() {

	}
	
	public void setDbEnvironment(BerkeleyDbEnv dbEnvironment) {
		this.dbEnvironment = dbEnvironment;
		emailRecipientGroupPrimaryIdx = this.dbEnvironment.getSmtpServerStore().getPrimaryIndex(String.class, EmailRecipientGroup.class);
	}
	
	@Override
	public List<EmailRecipientGroup> getEmailRecipientGroups() {
		List<EmailRecipientGroup> retList = new ArrayList<EmailRecipientGroup>();
		EntityCursor<EmailRecipientGroup> pi_cursor = emailRecipientGroupPrimaryIdx.entities();
		try {
		    for (EmailRecipientGroup node : pi_cursor) {
		        retList.add(node);
		    }
		// Always make sure the cursor is closed when we are done with it.
		} finally {
			pi_cursor.close();
		} 
		return retList;
	}
	
	@Override
	public EmailRecipientGroup getEmailRecipientGroup(String groupName) {
		EmailRecipientGroup server = emailRecipientGroupPrimaryIdx.get(groupName);
		return server;
	}
	
	@Override
	public void persistEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup) {
		emailRecipientGroupPrimaryIdx.put(emailRecipientGroup);
	}
	
	@Override
	public void deleteEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup) {
		emailRecipientGroupPrimaryIdx.delete(emailRecipientGroup.getEmailRecipientGroupName());		
	}
}
