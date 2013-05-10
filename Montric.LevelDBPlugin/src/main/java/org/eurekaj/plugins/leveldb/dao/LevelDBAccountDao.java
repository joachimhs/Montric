package org.eurekaj.plugins.leveldb.dao;

import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.eurekaj.api.dao.AccountDao;
import org.eurekaj.api.datatypes.AccessToken;
import org.eurekaj.api.datatypes.Account;
import org.eurekaj.api.datatypes.Session;
import org.eurekaj.api.datatypes.User;
import org.eurekaj.api.datatypes.basic.BasicAccessToken;
import org.eurekaj.api.datatypes.basic.BasicAccount;
import org.eurekaj.api.datatypes.basic.BasicSession;
import org.eurekaj.api.datatypes.basic.BasicUser;
import org.iq80.leveldb.DB;
import org.iq80.leveldb.DBIterator;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import static org.iq80.leveldb.impl.Iq80DBFactory.*;

public class LevelDBAccountDao implements AccountDao {
	private Logger logger = Logger.getLogger(LevelDBAccountDao.class.getName());
	
	private DB db;
	private static final String accountBucketKey = "account;";
	private static final String userBucketKey = "user;";
	private static final String sessionBucketKey = "session;";
	private static final String accessTokenBucketKey = "accessToken;";
	private Gson gson = new GsonBuilder().serializeSpecialFloatingPointValues().serializeNulls().create();
	
	public LevelDBAccountDao(DB db) {
		this.db = db;
	}
	
	@Override
	public List<Account> getAccounts() {
		List<Account> accountList = new ArrayList<>();
		
		DBIterator iterator = db.iterator();
		iterator.seek(bytes(accountBucketKey));
		while (iterator.hasNext() && asString(iterator.peekNext().getKey()).startsWith(accountBucketKey)) {
			accountList.add(gson.fromJson(asString(iterator.next().getValue()), BasicAccount.class));
		}
		return accountList;
	}

	@Override
	public Account getAccount(String id) {
		String json = asString(db.get(bytes(accountBucketKey + id)));
		BasicAccount account = gson.fromJson(json, BasicAccount.class);
		return account;
	}

	@Override
	public void persistAccount(Account account) {
		db.put(bytes(accountBucketKey + account.getId()), bytes(gson.toJson(new BasicAccount(account))));
	}

	@Override
	public User getUser(String username, String accountName) {
		String json = asString(db.get(bytes(userBucketKey + username.replace("@", "__") + ";" + accountName)));
		BasicUser user = gson.fromJson(json, BasicUser.class);
		return user;
	}
	
	@Override
	public List<User> getUsers(String username) {
		List<User> userList = new ArrayList<>();
		
		DBIterator iterator = db.iterator();
		iterator.seek(bytes(userBucketKey + ";" + username.replace("@", "__")));
		while (iterator.hasNext() && asString(iterator.peekNext().getKey()).startsWith(userBucketKey)) {
			BasicUser user = gson.fromJson(asString(iterator.next().getValue()), BasicUser.class);
			if (user.getUserName().equals(username)) {
				userList.add(user);
			}
		}
		
		return userList;
	}

	@Override
	public void persistUser(User user) {
		db.put(bytes(userBucketKey + user.getUserName().replace("@", "__") + ";" + user.getAccountName()), bytes(gson.toJson(new BasicUser(user))));		
	}
	
	@Override
	public Session getSession(String uuid) {
		String json = asString(db.get(bytes(sessionBucketKey + uuid)));
		BasicSession session = gson.fromJson(json, BasicSession.class);
		return session;
	}
	
	@Override
	public void persistSession(Session session) {
		db.put(bytes(sessionBucketKey + session.getUuid()), bytes(gson.toJson(new BasicSession(session))));		
	}
	
	@Override
	public AccessToken getAccessToken(String accessToken) {
		String json = asString(db.get(bytes(accessTokenBucketKey + accessToken)));
		BasicAccessToken session = gson.fromJson(json, BasicAccessToken.class);
		return session;
	}
	
	@Override
	public void persistAccessToken(AccessToken accessToken) {
		db.put(bytes(accessTokenBucketKey + accessToken.getId()), bytes(gson.toJson(new BasicAccessToken(accessToken))));		
	}

}
