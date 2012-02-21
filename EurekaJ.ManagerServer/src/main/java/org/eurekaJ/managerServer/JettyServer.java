/**
    EurekaJ Profiler - http://eurekaj.haagen.name
    
    Copyright (C) 2010-2011 Joachim Haagen Skeie

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
package org.eurekaJ.managerServer;

import java.io.File;
import java.io.FileInputStream;
import java.util.Collection;
import java.util.Enumeration;
import java.util.Properties;

import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.webapp.WebAppContext;
import org.eclipse.jetty.xml.XmlConfiguration;

public class JettyServer {
	private static Logger log = Logger.getLogger(JettyServer.class);
	private static Server jettyServer;
	private static int localPort;

	public static void main(String[] args) throws Exception {
		start();
	}

	private static void start() throws Exception {
		if (jettyServer != null && jettyServer.isRunning()) {
			log.warn("JettyServer.start() called, but the server is already started.");
			return;
		}
		configure();
		jettyServer.start();
		localPort = jettyServer.getConnectors()[0].getLocalPort();
		log.info("JettyServer started at http://localhost:" + localPort + "/");
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
			log.info("Server properties loaded from " + configFile.getAbsolutePath());
			for (Enumeration<Object> e = properties.keys(); e.hasMoreElements();) {
				Object property = (String) e.nextElement();
				log.info("\t\t* " + property + "=" + properties.get(property));
			}
		} else {
			String message = "Could not find " + configFile.getAbsolutePath() + ". Unable to start.";
			log.fatal(message);
			throw new RuntimeException(message);
		}

		setProperties(properties);
		jettyServer = new Server(Integer.parseInt(System.getProperty("jetty.port", "8080")));

		File jettyConfigFile = new File("jetty.xml");
		if (!jettyConfigFile.exists()) {
			jettyConfigFile = new File("../jetty.xml");
		}
		if (!jettyConfigFile.exists()) {
			jettyConfigFile = new File("../../jetty.xml");
		}
		if (jettyConfigFile.exists()) {
			log.info("Configuring Jetty with jetty.xml: " + jettyConfigFile.getAbsolutePath());
			XmlConfiguration configuration = new XmlConfiguration(jettyConfigFile.toURL());
			configuration.configure(jettyServer);
		} else {
			String message = "Unable to find " + jettyConfigFile.getAbsolutePath() + ". Unble to start.";
			log.fatal(message);
			throw new RuntimeException(message);
		}

		setWebAppContext();
	}

	private static void setWebAppContext() {
		File repoDir = new File(System.getProperty("basedir", "target"));
		System.out.println("Using repo directory: " + repoDir.getAbsolutePath() + " exists: " + repoDir.exists());
		String artifactId = System.getProperty("context.root", "");
		
		String inplace = System.getProperty("inplace.trueFalse", "false");
		if (inplace.equalsIgnoreCase("true")) {
			String targetPath = repoDir.getAbsolutePath();
			targetPath = targetPath.substring(0, 
					targetPath.indexOf("EurekaJ.Manager")) + 
						"EurekaJ.Manager" + 
						File.separatorChar + "src" + 
						File.separatorChar + "main" + 
						File.separatorChar + "webapp/";
			System.out.println("Inplace Path: " + targetPath);
			//System.out.println(repoDir.getParentFile().getParentFile().getAbsolutePath() + File.separatorChar + "EurekaJ.Manager");
			WebAppContext wc = new WebAppContext();
			wc.setContextPath("/" + artifactId);
			//wc.setExtraClasspath(repoDir.getAbsolutePath().replaceAll("EurekaJ.ManagerServer", "EurekaJ.Manager") + "/classes/");
			wc.setExtraClasspath(System.getProperty("java.class.path").replaceAll(":", ";") + ";" + repoDir.getAbsolutePath().replaceAll("EurekaJ.ManagerServer", "EurekaJ.Manager") + "/classes/");
			wc.setDescriptor(targetPath + "WEB-INF/web.xml");
			wc.setResourceBase(targetPath);
			jettyServer.setHandler(wc);
		} else {
			if (repoDir.canRead()) {
				Collection<File> warFiles = FileUtils.listFiles(repoDir, new String[] { "war" }, true);
				new WebAppContext();
				if (!warFiles.isEmpty()) {
					for (File warFile : warFiles) {
						jettyServer.setHandler(new WebAppContext(warFile.getAbsolutePath(), "/" + artifactId));
					}
				} else {
					String melding = "Unable to find any webapplications (.war) in: " + repoDir.getAbsolutePath() + ". Unable to start.";
					log.fatal(melding);
					throw new RuntimeException(melding);
				}
			} else {
				String melding = "Unable to read: " + repoDir.getAbsolutePath() + ". Unable to start.";
				log.fatal(melding);
				throw new RuntimeException(melding);
			}
		}
	}

	private static void setProperties(Properties properties) {
		Enumeration<Object> propEnum = properties.keys();
		while (propEnum.hasMoreElements()) {
			String property = (String) propEnum.nextElement();
			System.setProperty(property, properties.getProperty(property));
		}
	}

	public static void stop() throws Exception {
		if (jettyServer != null) {
			try {
				jettyServer.stop();
				log.info("JettyServer Stopped on http://localhost:" + localPort + "/");
			} catch (InterruptedException e) {
				log.fatal("Unable to stop JettyServer.");
				throw new RuntimeException(e);
			}
		}
	}

	public static Server getJettyServer() {
		return jettyServer;
	}
}
