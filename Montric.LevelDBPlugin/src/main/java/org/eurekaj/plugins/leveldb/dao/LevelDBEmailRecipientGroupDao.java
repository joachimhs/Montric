package org.eurekaj.plugins.leveldb.dao;

import static org.iq80.leveldb.impl.Iq80DBFactory.*;

import java.util.ArrayList;
import java.util.List;

import org.eurekaj.api.dao.SmtpDao;
import org.eurekaj.api.datatypes.EmailRecipientGroup;
import org.eurekaj.api.datatypes.basic.BasicEmailRecipientGroup;
import org.iq80.leveldb.DB;
import org.iq80.leveldb.DBIterator;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class LevelDBEmailRecipientGroupDao implements SmtpDao {
	private DB db;
	private Gson gson = new GsonBuilder().serializeSpecialFloatingPointValues().serializeNulls().create();
	private static final String emailGroupBucketKey = "emailGroup;";

	public LevelDBEmailRecipientGroupDao(DB db) {
		super();
		this.db = db;
	}

	@Override
	public List<EmailRecipientGroup> getEmailRecipientGroups(String accountName) {
		List<EmailRecipientGroup> emailGroupList = new ArrayList<>();
		
		DBIterator iterator = db.iterator();
		iterator.seek(bytes(emailGroupBucketKey + accountName));
		while (iterator.hasNext() && asString(iterator.peekNext().getKey()).startsWith(emailGroupBucketKey + accountName)) {
			BasicEmailRecipientGroup emailGroup = gson.fromJson(asString(iterator.next().getValue()), BasicEmailRecipientGroup.class);
			emailGroupList.add(emailGroup);
		}
		
		return emailGroupList;
	}

	@Override
	public EmailRecipientGroup getEmailRecipientGroup(String groupName, String accountName) {
		String json = asString(db.get(bytes(emailGroupBucketKey + accountName + ";" + groupName)));
		BasicEmailRecipientGroup emailGroup = gson.fromJson(json, BasicEmailRecipientGroup.class);
		return emailGroup;
	}

	@Override
	public void persistEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup) {
		db.put(bytes(emailGroupBucketKey + emailRecipientGroup.getAccountName() + ";" + emailRecipientGroup.getEmailRecipientGroupName()), bytes(gson.toJson(new BasicEmailRecipientGroup(emailRecipientGroup))));
	}

	@Override
	public void deleteEmailRecipientGroup(EmailRecipientGroup emailRecipientGroup) {
		db.delete(bytes(emailGroupBucketKey + emailRecipientGroup.getAccountName() + ";" + emailRecipientGroup.getEmailRecipientGroupName()));
	}

	@Override
	public void deleteEmailRecipientGroup(String groupName, String accountName) {
		db.delete(bytes(emailGroupBucketKey + accountName + ";" + groupName));
	}

}
