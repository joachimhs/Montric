package org.eurekaj.proxy.app;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.cookie.Cookie;
import org.apache.http.entity.StringEntity;
import org.apache.http.examples.client.ClientGZipContentCompression;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.protocol.HTTP;
import org.apache.http.util.EntityUtils;
import org.eurekaj.proxy.FileMatcher;
import org.eurekaj.proxy.parser.ParseStatistics;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.PrivilegedExceptionAction;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Properties;
import java.util.regex.Pattern;

public class Main {
    private String scriptPath;
    private String endpointUrl;
    private String username;
    private String password;

    private Pattern filePattern = Pattern.compile(".*\\d+");
    private ClientGZipContentCompression gzipClient;

    public static void main(String[] args) {
        Main main = new Main();
    }

    public Main() {
        try {
            readProperties();
        } catch (IOException e) {
            System.err.println("Unable to read required properties file 'config.properties'.");
            throw new RuntimeException("Required properties file missing: 'config.properties'");
        }

        gzipClient = new ClientGZipContentCompression(endpointUrl, username, password);

        parseAndSendBtraceScripts(scriptPath);
    }

    private void parseAndSendBtraceScripts(String scriptPath) {
        while (true) {
            try {
                List<File> scriptOutputfileList = FileMatcher.getScriptOutputFilesInDirectory(scriptPath);

                for (File scriptOutputfile : scriptOutputfileList) {
                    String json = ParseStatistics.parseBtraceFile(scriptOutputfile);
                    System.out.println("Attempting to send JSON contents of: " + scriptOutputfile.getName() + " length: " + json.length());

                    int statusCode = gzipClient.sendGzipOverHttp(json);
                    if (statusCode != 200) {
                        System.out.println("Unable to send JSON data. Server returned status code: " + statusCode + ". Please verify your endpoint, username and password in your 'config.properties' file");
                    } else {
                        scriptOutputfile.delete();
                    }
                }
            } catch (IOException ioe) {
                ioe.printStackTrace();
            } catch (Exception e) {
                e.printStackTrace();
            }

            try {
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    private void readProperties() throws IOException {
        Properties properties = new Properties();
		File configFile = new File("config.properties");
		if (!configFile.exists()) {
            System.out.println("config.properties not found at : " + configFile.getAbsolutePath() + " trying one level up.");
			configFile = new File("../config.properties");
		}
		if (!configFile.exists()) {
            System.out.println("config.properties not found at : " + configFile.getAbsolutePath() + " trying one level up.");
			configFile = new File("../../config.properties");
		}
		if (configFile.exists()) {
			FileInputStream configStream = new FileInputStream(configFile);
			properties.load(configStream);
			configStream.close();
			System.out.println("Server properties loaded from " + configFile.getAbsolutePath());
			for (Enumeration<Object> e = properties.keys(); e.hasMoreElements();) {
				Object property = (String) e.nextElement();
				System.out.println("\t\t* " + property + "=" + properties.get(property));
			}
		} else {
			String message = "Could not find " + configFile.getAbsolutePath() + ". Unable to start.";
			System.err.println(message);
			throw new RuntimeException(message);
		}

		setProperties(properties);
    }

    private void setProperties(Properties properties) {
        scriptPath = (String)properties.get("eurekaj.proxy.scriptpath");
        endpointUrl = (String)properties.get("eurekaj.proxy.endpoint");
        username = (String)properties.get("eurekaj.proxy.username");
        password = (String)properties.get("eurekaj.proxy.password");

        if (scriptPath == null || scriptPath.length() == 1) {
            throw new RuntimeException("The properties file 'config.properties' requires that the property 'eurekaj.proxy.scriptpath' is defined. Example: eurekaj.proxy.scriptpath=/path/to/btrace/scripts");
        }

        if (endpointUrl == null || endpointUrl.length() == 1) {
            throw new RuntimeException("The properties file 'config.properties' requires that the property 'eurekaj.proxy.endpoint' is defined. Example: eurekaj.proxy.endpoint=http://hostname:port");
        }

        if (username == null || username.length() == 1) {
            throw new RuntimeException("The properties file 'config.properties' requires that the property 'eurekaj.proxy.username' is defined. Example: eurekaj.proxy.username=username");
        }

        if (password == null || password.length() == 1) {
            throw new RuntimeException("The properties file 'config.properties' requires that the property 'eurekaj.proxy.scriptpath' is defined. Example: eurekaj.proxy.password=password");
        }

	}
}
