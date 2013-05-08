package org.eurekaj.plugins.riak.dao;

import java.util.ArrayList;
import java.util.List;

import org.eurekaj.api.dao.SmtpDao;
import org.eurekaj.api.datatypes.EmailRecipientGroup;
import org.eurekaj.api.datatypes.basic.BasicEmailRecipientGroup;

import com.basho.riak.client.IRiakClient;
import com.basho.riak.client.RiakException;
import com.basho.riak.client.RiakRetryFailedException;
import com.basho.riak.client.bucket.Bucket;
import com.basho.riak.client.query.indexes.BucketIndex;

public class RiakEmailRecipientGroupDao implements SmtpDao {
	private IRiakClient riakClient;
	
	public RiakEmailRecipientGroupDao(IRiakClient riakClient) {
		super();
		this.riakClient = riakClient;
	}

	@Override
	public List<EmailRecipientGroup> getEmailRecipientGroups(String accountName) {
		List<EmailRecipientGroup> emailGroupList = new ArrayList<EmailRecipientGroup>();

        Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("Email Group;" + accountName).execute();

            for (String key : myBucket.fetchIndex(BucketIndex.index).withValue("$key").execute()) {
                emailGroupList.add(myBucket.fetch(key, BasicEmailRecipientGroup.class).execute());
            }
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        } catch (RiakException e) {
            e.printStackTrace();
        }

        return emailGroupList;
	}

	@Override
	public EmailRecipientGroup getEmailRecipientGroup(String groupName, String accountName) {
		BasicEmailRecipientGroup emailGroup = null;

        Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("Email Group;" + accountName).execute();
            emailGroup = myBucket.fetch(groupName, BasicEmailRecipientGroup.class).execute();
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        }

        return emailGroup;
	}

	@Override
	public void persistEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup) {
		Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("Email Group;" + emailRecipientGroup.getAccountName()).execute();
            myBucket.store(emailRecipientGroup.getEmailRecipientGroupName(), emailRecipientGroup).execute();
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        }
		
	}

	@Override
	public void deleteEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup) {
		this.deleteEmailRecipientGroup(emailRecipientGroup.getEmailRecipientGroupName(), emailRecipientGroup.getAccountName());
	}

	@Override
	public void deleteEmailRecipientGroup(String groupName, String accountName) {
		Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("Email Group;" + accountName).execute();
            myBucket.delete(groupName).execute();
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        } catch (RiakException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}}

}
