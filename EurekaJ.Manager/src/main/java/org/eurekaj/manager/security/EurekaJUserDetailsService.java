package org.eurekaj.manager.security;

import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import org.springframework.dao.DataAccessException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.io.*;
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

        String param1 = System.getProperty("PARAM1");
        if (param1 != null && param1.equalsIgnoreCase("AWS")) {
            loadUsersFromProperties(loadUserPropertiesFromAmazonS3());
        } else {
            loadUsersFromProperties(loadUserPropertiesFromFilesystem());
        }


    }

    private Properties loadUserPropertiesFromAmazonS3() {
        Properties properties = new Properties();

        AmazonS3 amazonS3 = new AmazonS3Client(new BasicAWSCredentials(System.getProperty("AWS_ACCESS_KEY_ID"), System.getProperty("AWS_SECRET_KEY")));
        S3Object object = amazonS3.getObject(new GetObjectRequest("EurekaJ", "users.properties"));

        InputStreamReader reader = new InputStreamReader(object.getObjectContent());

        try {
            properties.load(reader);
        } catch (IOException e) {
            e.printStackTrace();
            String message = "Unable to find users file in Amazon S3. Unable to start.";
            throw new RuntimeException(message);
        }

        return properties;
    }

    private Properties loadUserPropertiesFromFilesystem() {
        Properties properties = new Properties();

        try {
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


        } catch (FileNotFoundException e) {
            throw new RuntimeException(e.getMessage(), e);
        } catch (IOException e) {
            throw new RuntimeException(e.getMessage(), e);
        }

        return properties;
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
