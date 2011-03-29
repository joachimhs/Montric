package org.eurekaj.manager.security;

import org.springframework.security.core.GrantedAuthority;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 3/29/11
 * Time: 12:49 PM
 * To change this template use File | Settings | File Templates.
 */
public class EurekaJGrantedAuthority implements GrantedAuthority {
    private String authority;

    public EurekaJGrantedAuthority(String authority) {
        this.authority = authority;
    }

    @Override
    public String getAuthority() {
        return this.authority;
    }
}
