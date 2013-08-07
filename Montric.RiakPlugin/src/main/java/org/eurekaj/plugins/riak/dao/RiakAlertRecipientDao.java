package org.eurekaj.plugins.riak.dao;

import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.eurekaj.api.dao.AlertRecipientDao;
import org.eurekaj.api.datatypes.AlertRecipient;
import org.eurekaj.api.datatypes.basic.BasicAlertRecipient;

import com.basho.riak.client.IRiakClient;

public class RiakAlertRecipientDao implements AlertRecipientDao {
	private Logger logger = Logger.getLogger(RiakAlertRecipientDao.class.getName());
	private static final String alertRecipientBucketKey = "AlertRecipient";
	
    private IRiakClient riakClient;

    public RiakAlertRecipientDao(IRiakClient riakClient) {
        this.riakClient = riakClient;
    }
    
	@Override
	public List<AlertRecipient> getAlertRecipients(String accountName) {
		List<AlertRecipient> retList = new ArrayList<>();
		retList.addAll(RiakAbstractDao.getListFromRiakBucket(riakClient, alertRecipientBucketKey, new BasicAlertRecipient(), BasicAlertRecipient.class));
		return retList;
	}

	@Override
	public AlertRecipient getAlertRecipient(String accountName, String alertRecipientName) {
		return RiakAbstractDao.getObjectFromBucket(riakClient, alertRecipientBucketKey, accountName + ";" + alertRecipientName, new BasicAlertRecipient(), BasicAlertRecipient.class);
	}

	@Override
	public void persistAlertRecipient(AlertRecipient alertRecipient) {
		RiakAbstractDao.persistObjectInBucket(riakClient, alertRecipientBucketKey, alertRecipient.getAccountName() + ";" + alertRecipient.getId(), alertRecipient);
	}

	@Override
	public void deleteAlertRecipient(AlertRecipient alertRecipient) {
		this.deleteAlertRecipient(alertRecipient.getAccountName(), alertRecipient.getId());
	}

	@Override
	public void deleteAlertRecipient(String accountName, String id) {
		RiakAbstractDao.deleteObjectInBucket(riakClient, accountName, id);
	}
}
