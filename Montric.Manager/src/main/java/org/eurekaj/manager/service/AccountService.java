package org.eurekaj.manager.service;

import org.eurekaj.api.datatypes.AccessToken;
import org.eurekaj.api.datatypes.Account;
import org.eurekaj.api.datatypes.Session;
import org.eurekaj.api.datatypes.User;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: joahaa
 * Date: 2/4/13
 * Time: 5:42 PM
 * To change this template use File | Settings | File Templates.
 */
public interface AccountService {

    public List<Account> getAccounts();

    public Account getAccount(String accountName);

    public void persistAccount(Account account);

    public User getUser(String username, String accountName);
    
    public List<User> getUsers(String username);

    public void persistUser(User user);
    
    public Session getSession(String uuid);
    
    public void persistSession(Session session);
    
    public AccessToken getAccessToken(String accessToken);
    
    public void persistAccessToken(AccessToken accessToken);
}
