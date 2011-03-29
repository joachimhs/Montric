package org.eurekaj.manager.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 3/29/11
 * Time: 9:57 AM
 * To change this template use File | Settings | File Templates.
 */
public class SecurityManager {

    private static Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    private static boolean isAuthenticated() {
        boolean isAuthenticated = false;

        if (getAuthentication() != null) {
            isAuthenticated = true;
        }

        return isAuthenticated;
    }

    private static UserDetails getUserDetails() {
        UserDetails userDetails = null;

        if (isAuthenticated()) {
            Object principal = getAuthentication().getPrincipal();
            if (principal instanceof UserDetails) {
                userDetails = (UserDetails)principal;
            }

        }

        return userDetails;
    }

    private static boolean userDetailsIsRole(UserDetails userDetails, String roleName) {
        boolean containsRole = false;

        //If userDetails is null, return false right away
        if (userDetails == null) {
            return false;
        }

        for (GrantedAuthority grantedAuthority : userDetails.getAuthorities()) {
            if (grantedAuthority.getAuthority().equals(roleName)) {
                //Logged in user is of role roleName
                containsRole = true;
                break;
            }
        }

        System.out.println("userDetailsIsRole() = " + containsRole);
        return containsRole;
    }

    public static boolean isAuthenticatedAsUser() {
        boolean isAuthenticated = false;

        if (isAuthenticated() && userDetailsIsRole(getUserDetails(), "ROLE_USER")) {
            isAuthenticated = true;

        }

        return  isAuthenticated;
    }

    public static boolean isAuthenticatedAsAdmin() {
        boolean isAuthenticated = false;

        if (isAuthenticated() && userDetailsIsRole(getUserDetails(), "ROLE_ADMIN")) {
            isAuthenticated = true;

        }

        return  isAuthenticated;
    }
}
