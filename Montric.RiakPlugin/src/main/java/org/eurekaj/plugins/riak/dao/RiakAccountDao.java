package org.eurekaj.plugins.riak.dao;

import java.util.ArrayList;
import java.util.List;

import org.eurekaj.api.dao.AccountDao;
import org.eurekaj.api.datatypes.AccessToken;
import org.eurekaj.api.datatypes.Account;
import org.eurekaj.api.datatypes.Session;
import org.eurekaj.api.datatypes.User;
import org.eurekaj.api.datatypes.basic.BasicAccessToken;
import org.eurekaj.api.datatypes.basic.BasicAccount;
import org.eurekaj.api.datatypes.basic.BasicSession;
import org.eurekaj.api.datatypes.basic.BasicUser;

import com.basho.riak.client.IRiakClient;
import com.basho.riak.client.RiakException;
import com.basho.riak.client.RiakRetryFailedException;
import com.basho.riak.client.bucket.Bucket;
import com.basho.riak.client.query.indexes.BucketIndex;

public class RiakAccountDao implements AccountDao {
	private IRiakClient riakClient;
	
	public RiakAccountDao(IRiakClient riakClient) {
		this.riakClient = riakClient;
	}
	
	@Override
	public List<Account> getAccounts() {
		List<Account> accountList = new ArrayList<Account>();

        Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("Account").execute();

            for (String key : myBucket.fetchIndex(BucketIndex.index).withValue("$key").execute()) {
            	accountList.add(myBucket.fetch(key, BasicAccount.class).execute());
            }
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        } catch (RiakException e) {
            e.printStackTrace();
        }

        return accountList;
	}

	@Override
	public Account getAccount(String id) {
		Account account = null;
		
		Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("Account").execute();
        	account = myBucket.fetch(id, BasicAccount.class).execute();
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        } catch (RiakException e) {
            e.printStackTrace();
        }
        
		return account;
	}

	@Override
	public void persistAccount(Account account) {
		Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("Account").execute();
            myBucket.store(account.getId(), account).execute();
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        }
	}

	@Override
	public User getUser(String username, String accountName) {
		BasicUser user = null;
		
		Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("User;" + accountName).execute();
            user = myBucket.fetch(username, BasicUser.class).execute();
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        } catch (RiakException e) {
            e.printStackTrace();
        }
        
		return user;
	}
	
	@Override
	public List<User> getUsers(String username) {
		List<User> userList = new ArrayList<>();
		
		Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("User;" + username).execute();
            for (String key : myBucket.fetchIndex(BucketIndex.index).withValue("$key").execute()) {
            	userList.add(myBucket.fetch(key, BasicUser.class).execute());
            }
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        } catch (RiakException e) {
            e.printStackTrace();
        }
        
		return userList;
	}

	@Override
	public void persistUser(User user) {
		Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("User;" + user.getUserName()).execute();
            myBucket.store(user.getAccountName(), new BasicUser(user)).execute();
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        }		
	}

	@Override
	public void persistSession(Session session) {
		Bucket myBucket = null;
        try {
        	myBucket = riakClient.fetchBucket("Session;" + session.getEmail()).execute();
        	myBucket.store(session.getAccountName(), new BasicSession(session));
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        }
	}
	
	@Override
	public Session getSession(String uuid) {
		BasicSession session = null;
		
		Bucket myBucket = null;
        try {
        	myBucket = riakClient.fetchBucket("Session;").execute();
            session = myBucket.fetch(uuid, BasicSession.class).execute();
        } catch(RiakRetryFailedException rrfe) {
        	rrfe.printStackTrace();
        }
        
        return session;
	}
	
	@Override
	public AccessToken getAccessToken(String accessToken) {
		BasicAccessToken session = null;
		
		Bucket myBucket = null;
        try {
        	myBucket = riakClient.fetchBucket("AccessToken;").execute();
            session = myBucket.fetch(accessToken, BasicAccessToken.class).execute();
        } catch(RiakRetryFailedException rrfe) {
        	rrfe.printStackTrace();
        }
        
        return session;
	}
	
	@Override
	public void persistAccessToken(AccessToken accessToken) {
		Bucket myBucket = null;
        try {
        	myBucket = riakClient.fetchBucket("AccessToken;").execute();
        	myBucket.store(accessToken.getId(), new BasicAccessToken(accessToken));
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        }
	}
}
