package org.eurekaj.api.dao;

import java.lang.String;
import java.util.List;

import org.eurekaj.api.dao.LiveStatisticsDao;
import org.eurekaj.api.datatypes.Account;
import org.eurekaj.api.datatypes.User;

/**
 * Created with IntelliJ IDEA.
 * User: joahaa
 * Date: 2/4/13
 * Time: 5:44 PM
 * To change this template use File | Settings | File Templates.
 */
public interface AccountDao {
    public List<Account> getAccounts();

    public Account getAccount(String accountName);

    public void persistAccount(Account account);

    public User getUser(String username, String accountName);

    public void persistUser(String username, String accountName, String role);
}
