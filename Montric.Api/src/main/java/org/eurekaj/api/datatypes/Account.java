package org.eurekaj.api.datatypes;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: joahaa
 * Date: 2/3/13
 * Time: 9:29 PM
 * To change this template use File | Settings | File Templates.
 */
public interface Account {
    public String getId();
    public String getAccountType();
    public List<String> getAccessTokens();
}
