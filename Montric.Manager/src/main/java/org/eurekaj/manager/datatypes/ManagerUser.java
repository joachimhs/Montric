package org.eurekaj.manager.datatypes;

import org.eurekaj.api.datatypes.User;

/**
 * Created with IntelliJ IDEA.
 * User: joahaa
 * Date: 2/4/13
 * Time: 6:24 PM
 * To change this template use File | Settings | File Templates.
 */
public class ManagerUser implements User {
    private String userName;
    private String accountName;
    private String userRole;

    public ManagerUser() {
    }

    public ManagerUser(String userName, String accountName, String userRole) {
        this.userName = userName;
        this.accountName = accountName;
        this.userRole = userRole;
    }

    public ManagerUser(User user) {
        this.userName = user.getUserName();
        this.accountName = user.getAccountName();
        this.userRole = user.getUserRole();
    }


    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }
}
