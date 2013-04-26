package org.eurekaj.manager.service;

import org.eurekaj.api.datatypes.Account;
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
    EurekaJDBPluginService dbPlugin = null;

    private EurekaJDBPluginService getDbPlugin() {
        if (dbPlugin == null) {
            dbPlugin = ManagerDbPluginService.getInstance().getPluginServiceWithName(DatabasePluginUtil.getDatabasePluginName());
        }

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
    public void persistUser(String username, String accountName, String role) {
        getDbPlugin().getAccountDao().persistUser(username, accountName, role);
    }

    @Override
    public Account getAccount(String accountName) {
        return getDbPlugin().getAccountDao().getAccount(accountName);
    }

    @Override
    public List<Account> getAccounts() {
        return getDbPlugin().getAccountDao().getAccounts();
    }
}
