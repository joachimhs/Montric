package org.eurekaj.manager.util;

import org.apache.log4j.Logger;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 4/4/12
 * Time: 8:19 AM
 * To change this template use File | Settings | File Templates.
 */
public class ClassPathUtil {
    private static Logger logger = Logger.getLogger(ClassPathUtil.class.getName());
    private static List<String> directoriesAdded = new ArrayList<String>();
    // Parameters
    private static final Class[] parameters = new Class[]
            {
                    URL.class
            };

    
    public static void addPluginDirectory() {
        File pluginsDir = new File("plugins");
        if (!pluginsDir.exists()) {
            pluginsDir = new File("../plugins");
        }

        if (pluginsDir.exists() && pluginsDir.isDirectory()) {
            logger.info("Adding Plugins from Directory: " + pluginsDir.getAbsolutePath());
            try {
                addDirToClasspath(pluginsDir);
            } catch (IOException e) {
                logger.error("Unable to load plugin: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
    
    /**
     * Adds the jars in the given directory to classpath
     *
     * @param directory
     * @throws IOException
     */
    public static void addDirToClasspath(File directory) throws IOException {
        if (directory.exists() && !directoriesAdded.contains(directory.getAbsolutePath())) {
            File[] files = directory.listFiles();
            for (int i = 0; i < files.length; i++) {
                File file = files[i];
                addURL(file.toURI().toURL());
            }
            
            directoriesAdded.add(directory.getAbsolutePath());
        } else if (directoriesAdded.contains(directory.getAbsolutePath())) {
            logger.warn("The directory \"" + directory + "\" is already loaded!");
        } else {
            logger.warn("The directory \"" + directory + "\" does not exist!");
        }
    }

    /**
     * Add URL to CLASSPATH
     *
     * @param url URL
     * @throws IOException IOException
     */
    public static void addURL(URL url) throws IOException {
        if (url.toString().endsWith(".jar")) {
            logger.info("Adding Plugin from URL: " + url.toString());
            URLClassLoader sysLoader = (URLClassLoader) Thread.currentThread().getContextClassLoader();//ClassLoader.getSystemClassLoader().getSystemClassLoader();
            URL urls[] = sysLoader.getURLs();
            for (int i = 0; i < urls.length; i++) {
                if (urls[i].toString().equalsIgnoreCase(url.toString())) {
                    logger.info("URL " + url + " is already in the CLASSPATH");
                    return;
                }
            }
            Class<URLClassLoader> sysclass = URLClassLoader.class;
            try {
                Method method = sysclass.getDeclaredMethod("addURL", parameters);
                method.setAccessible(true);
                method.invoke(sysLoader, new Object[]{url});
            } catch (Throwable t) {
                t.printStackTrace();
                logger.error("Error, could not add URL to system classloader");
            }
        }
    }
}
