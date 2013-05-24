package org.eurekaj.manager.service;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.AccessToken;
import org.eurekaj.api.datatypes.Account;
import org.eurekaj.api.datatypes.Session;
import org.eurekaj.api.datatypes.User;
import org.eurekaj.manager.plugin.ManagerDbPluginService;
import org.eurekaj.manager.util.DatabasePluginUtil;
import org.eurekaj.spi.db.EurekaJDBPluginService;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: joahaa
 * Date: 2/4/13
 * Time: 5:43 PM
 * To change this template use File | Settings | File Templates.
 */
public class ManagerAccountService implements AccountService {
	private static Logger logger = Logger.getLogger(ManagerAccountService.class.getName());
	
    EurekaJDBPluginService dbPlugin = null;

    private EurekaJDBPluginService getDbPlugin() {
    	logger.info("Getting dbPlugin: " + dbPlugin);
        if (dbPlugin == null) {
        	logger.info("Finding plugin with name: " + DatabasePluginUtil.getDatabasePluginName());
            dbPlugin = ManagerDbPluginService.getInstance().getPluginServiceWithName(DatabasePluginUtil.getDatabasePluginName());
        }
        
        logger.info("returning plugin: " + dbPlugin);

        return dbPlugin;
    }
    @Override
    public void persistAccount(Account account) {
        getDbPlugin().getAccountDao().persistAccount(account);
    }

    @Override
    public User getUser(String username, String accountName) {
        return getDbPlugin().getAccountDao().getUser(username, accountName);
    }

    @Override
    public void persistUser(User user) {
        getDbPlugin().getAccountDao().persistUser(user);
    }

    @Override
    public Account getAccount(String accountName) {
        return getDbPlugin().getAccountDao().getAccount(accountName);
    }
    
    @Override
    public List<User> getUsers(String username) {
    	logger.info("Getting users with username: " + username);
    	return getDbPlugin().getAccountDao().getUsers(username);
    }

    @Override
    public List<Account> getAccounts() {
        return getDbPlugin().getAccountDao().getAccounts();
    }
    
    @Override
    public Session getSession(String uuid) {
    	return getDbPlugin().getAccountDao().getSession(uuid);
    }
    
    @Override
    public void persistSession(Session session) {
    	getDbPlugin().getAccountDao().persistSession(session);
    }
    
    @Override
    public AccessToken getAccessToken(String accessToken) {
    	return getDbPlugin().getAccountDao().getAccessToken(accessToken);
    }
    
    @Override
    public void persistAccessToken(AccessToken accessToken) {
    	getDbPlugin().getAccountDao().persistAccessToken(accessToken);    	
    }
}
