package org.eurekaj.manager.security;

import org.springframework.dao.DataAccessException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.*;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 3/29/11
 * Time: 11:20 AM
 * To change this template use File | Settings | File Templates.
 */
public class EurekaJUserDetailsService implements UserDetailsService {
    List<EurekaJUserDetails> configuredUsers;

    public EurekaJUserDetailsService() {
        configuredUsers = new ArrayList<EurekaJUserDetails>();

        try {
            Properties properties = new Properties();

            File configFile = new File("users.properties");
            if (!configFile.exists()) {
                configFile = new File("../users.properties");
            }
            if (!configFile.exists()) {
                configFile = new File("../../users.properties");
            }
            if (configFile.exists()) {
                FileInputStream configStream = new FileInputStream(configFile);
                properties.load(configStream);
                configStream.close();
            } else {
                String message = "Unable to find users file:" + configFile.getAbsolutePath() + ". Unable to start.";
                throw new FileNotFoundException(message);
            }

            loadUsersFromProperties(properties);
        } catch (FileNotFoundException e) {
            throw new RuntimeException(e.getMessage(), e);
        } catch (IOException e) {
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    private void loadUsersFromProperties(Properties userProperties) {
        for (String username : userProperties.stringPropertyNames()) {
            String userCredentials = userProperties.getProperty(username);
            String[] userCredentialsArray = userCredentials.split(",");
            if (userCredentialsArray.length >= 3) {
                String password = userCredentialsArray[0];
                String enabled = userCredentialsArray[userCredentialsArray.length - 1];
                List<GrantedAuthority> grantedAuthorityList = new ArrayList<GrantedAuthority>();
                for (int i = 1; i < userCredentialsArray.length - 1; i++) {
                    grantedAuthorityList.add(new EurekaJGrantedAuthority(userCredentialsArray[i]));
                }

                configuredUsers.add(new EurekaJUserDetails(grantedAuthorityList, password, username, true, true, true, enabled.equalsIgnoreCase("enabled")));
            }
        }
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException, DataAccessException {
        UserDetails userDetails = null;

        for (EurekaJUserDetails eurekaJUserDetails : configuredUsers) {
            if (eurekaJUserDetails.getUsername().equals(username)) {
                userDetails = eurekaJUserDetails;
                break;
            }
        }

        return userDetails;
    }
}
