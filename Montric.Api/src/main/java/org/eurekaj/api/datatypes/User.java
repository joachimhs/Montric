package org.eurekaj.api.datatypes;

/**
 * Created with IntelliJ IDEA.
 * User: joahaa
 * Date: 2/3/13
 * Time: 9:29 PM
 * To change this template use File | Settings | File Templates.
 */
public interface User {
	public String getId();
	public String getUserName();
    public String getAccountName();
    public String getUserRole();
    public String getFirstname();
    public String getLastname();
    public String getCompany();
    public String getCountry();
    public String getUsage();
;}
