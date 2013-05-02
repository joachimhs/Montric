package org.eurekaj.app;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Enumeration;
import java.util.Properties;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;
import org.apache.log4j.Logger;
import org.eurekaj.app.classloader.PluginClassLoader;
import org.eurekaj.app.plugin.AppWebappPluginService;

import com.google.gson.Gson;

public class Main {
	private static Logger logger = Logger.getLogger(Main.class.getName());
	private static PluginClassLoader eurekaJClassLoader;
	
	public static void main(String[] args) throws Exception {
		configure();
		
		eurekaJClassLoader = new PluginClassLoader(Thread.currentThread().getClass().getClassLoader());
		
		//-Dorg.eurekaj.webappDirectory=/srv/eurekaj/webapp -Dorg.eurekaj.pluginDirectory=/srv/eurekaj/plugins
		String pluginsDir = System.getProperty("org.montric.pluginDirectory", "/srv/eurekaj/plugins");
		String webappDir = System.getProperty("org.montric.webappDirectory", "/srv/eurekaj/webapp");
		System.setProperty("basedir", webappDir);
		
		/*Versions versions = getEurekaJVersions();
		Version version = versions.getEurekaJVersions().get(0);
		
		String eurekaJFilepath = downloadJarFromUrl(version.getServerJarUrl(), webappDir);
		loadEurekaJFromJar(eurekaJFilepath);
		
		String webappFilepath = downloadJarFromUrl(version.getWebappJarUrl(), webappDir);
		JarUtils.unjar(webappFilepath, new File(webappDir + File.separatorChar + "tmp"));
		
		loadPluginsFromDir(pluginsDir);*/
		
		AppWebappPluginService webappPluginService = new AppWebappPluginService();
	}
	
	private static void configure() throws Exception {
		Properties properties = new Properties();
		File configFile = new File("config.properties");
		if (!configFile.exists()) {
			configFile = new File("../config.properties");
		}
		if (!configFile.exists()) {
			configFile = new File("../../config.properties");
		}
		if (configFile.exists()) {
			FileInputStream configStream = new FileInputStream(configFile);
			properties.load(configStream);
			configStream.close();
			logger.info("Server properties loaded from " + configFile.getAbsolutePath());
			for (Enumeration<Object> e = properties.keys(); e.hasMoreElements();) {
				Object property = (String) e.nextElement();
				logger.info("\t\t* " + property + "=" + properties.get(property));
			}
		}
		
		setProperties(properties);
	}

	private static void setProperties(Properties properties) {
		Enumeration<Object> propEnum = properties.keys();
		while (propEnum.hasMoreElements()) {
			String property = (String) propEnum.nextElement();
			System.setProperty(property, properties.getProperty(property));
		}
		
		if (System.getProperty("org.montric.port") == null) {
			System.setProperty("org.montric.port", "8080");
			logger.info(" * Property 'org.montric.port' is not specified. Using default: 8080. Configure in file config.properties.");
		}
		
		if (System.getProperty("org.eurekaj.deleteStatsOlderThanDays") == null) {
			System.setProperty("org.eurekaj.deleteStatsOlderThanDays", "30");
			logger.info(" * Property 'org.eurekaj.deleteStatsOlderThanDays' is not specified. Using default: 30 Configure in file config.properties.");
		}
		
		if (System.getProperty("montric.db.type") == null) {
			System.setProperty("montric.db.type", "BerkeleyHour");
			logger.info(" * Property 'montric.db.type' is not specified. Using default: 'BerkeleyHour' Configure in file config.properties.");
		}
		
		
		if (System.getProperty("montric.db.absPath") == null) {
			System.setProperty("montric.db.absPath", "data");
			logger.info(" * Property 'montric.db.absPath' is not specified. Using default: 'data' Configure in file config.properties.");
		}
		
		if (System.getProperty("org.montric.webappDirectory") == null) {
			System.setProperty("org.montric.webappDirectory", "webapp");
			logger.info(" * Property 'org.montric.webappDirectory' is not specified. Using default: 'webapp' Configure in file config.properties.");
		}
		
		if (System.getProperty("org.montric.pluginDirectory") == null) {
			System.setProperty("org.montric.pluginDirectory", "plugins");
			logger.info(" * Property 'org.montric.pluginDirectory' is not specified. Using default: 'plugins' Configure in file config.properties.");
		}
	}
	
	private static void loadPluginsFromDir(String dir) {
		PluginClassLoader classLoader = new PluginClassLoader(ClassLoader.getSystemClassLoader());
		classLoader.addJarsFromDirectory(dir);
	}
	
	private static void loadEurekaJFromJar(String jar) {
		try {
			eurekaJClassLoader.loadJar(jar);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			System.exit(-1);
		}
	}
	
	private static Versions getEurekaJVersions() {
		String jsonContent = null;
		
		DefaultHttpClient httpclient = new DefaultHttpClient();
		HttpGet httpGet = new HttpGet("http://localhost/~joahaa/netty/eurekajVersions.json");
		
		HttpResponse response;
		try {
			response = httpclient.execute(httpGet);
			int statusCode = response.getStatusLine().getStatusCode();
			
			HttpEntity entity = response.getEntity();
			if (entity != null && statusCode == 200) {
				StringBuilder sb = new StringBuilder();
				
			    long len = entity.getContentLength();
			    if (len != -1 && len < 2048) {
			        sb.append(EntityUtils.toString(entity));
			    } else {
			        // Stream content out
			    }
			    
			    jsonContent = sb.toString();
			} else {
				System.err.println("Unable to get Versions file from URL. Exiting");
				System.exit(-1);
			}
		
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
     
		Versions versions = new Gson().fromJson(jsonContent, Versions.class);
		
		System.out.println("currentVersion: " + versions.getCurrentEurekaJVersion());
		System.out.println("Versions: ");
		for (Version version : versions.getEurekaJVersions()) {
			System.out.println("\tversionId: " + version.getVersionId());
			System.out.println("\tupgradesFrom: " + version.getUpgrdesFrom());
			System.out.println("\tserverJarUrl: " + version.getServerJarUrl());
			System.out.println("\twebappJarUrl: " + version.getWebappJarUrl() + "\n---");
		}
		
		return versions;
		
	}
	
	private static String downloadJarFromUrl(String url, String toDir) {
		String filename = url.substring(url.lastIndexOf(File.separatorChar));
				
		File file = new File(toDir + File.separatorChar + filename);
		if (file != null && file.exists() && file.isFile()) {
			logger.info("EurekaJ already downloaded, no need to download file again");
		} else {
			logger.info("Downloading EurekaJ from: " + url + " to: " + file.getAbsolutePath());
		
			DefaultHttpClient httpclient = new DefaultHttpClient();
			HttpGet httpGet = new HttpGet(url);
			
			HttpResponse response;
			
			try {
				response = httpclient.execute(httpGet);
				int statusCode = response.getStatusLine().getStatusCode();
			
				HttpEntity entity = response.getEntity();
				if (entity != null && statusCode == 200) {
					FileOutputStream fos = new java.io.FileOutputStream(file.getAbsolutePath());
					entity.writeTo(fos);
					fos.close();
				}
			} catch (ClientProtocolException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		
		return file.getAbsolutePath();
	}
}
