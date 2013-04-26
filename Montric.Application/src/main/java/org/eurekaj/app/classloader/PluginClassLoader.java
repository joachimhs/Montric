package org.eurekaj.app.classloader;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.Hashtable;

import org.apache.log4j.Logger;

public class PluginClassLoader extends ClassLoader {
	private static Logger logger = Logger.getLogger(PluginClassLoader.class.getName());
	private Hashtable<String, ClassLoader> loadedJars;
	private ClassLoader parentClassLoader;
	// Parameters
    private static final Class[] parameters = new Class[]
            {
                    URL.class
            };
	
	public PluginClassLoader(ClassLoader classLoader) {
		super(classLoader);
		this.parentClassLoader = classLoader;
		loadedJars = new Hashtable<String, ClassLoader>();
	}
	
	public void addJarsFromDirectory(String fullPath) {
		File jarPath = new File(fullPath);
		if (jarPath != null && jarPath.exists() && jarPath.isDirectory()) {
			logger.info("Adding jars in directory: " + fullPath);
			try {
                addDirToClasspath(jarPath);
            } catch (IOException e) {
                logger.error("Unable to load plugin: " + e.getMessage());
                e.printStackTrace();
            }
		}
	}
	
	public void loadJar(String fullPath) throws IOException {
		loadJar(new File(fullPath));
	}
	
	public void loadJar(File jarFile) throws IOException {
		if (jarFile != null && (jarFile.getName().endsWith(".jar") || jarFile.getName().endsWith(".war")) && !loadedJars.contains(jarFile.getAbsolutePath())) {
        	logger.info("Adding Plugin: " + jarFile.getAbsolutePath());
        	URL jarUrl = jarFile.toURI().toURL();
        	
        	JarClassLoader jarClassLoader = new JarClassLoader(jarUrl, Thread.currentThread().getContextClassLoader());
        	
        	Class<URLClassLoader> sysclass = URLClassLoader.class;
            try {
                Method method = sysclass.getDeclaredMethod("addURL", parameters);
                method.setAccessible(true);
                method.invoke(jarClassLoader.getParent(), new Object[]{jarUrl});
            } catch (Throwable t) {
                t.printStackTrace();
                logger.error("Error, could not add URL to classloader: " + parentClassLoader.getClass().getName());
            }
        	
        	loadedJars.put(jarFile.getAbsolutePath(), jarClassLoader);
        } else {
        	logger.info("Plugin already loaded by classLoader: " + loadedJars.get(jarFile.getAbsolutePath()));
        }
	}
	
	
	public void unloadJar(String fullPath) {
		unloadJar(new File(fullPath));
	}
	
	public void unloadJar(File jarFile) {
		if (loadedJars.contains(jarFile.getAbsolutePath())) {
			//TODO: Unload JAR
		}
	}
	
	
	/**
     * Adds the jars in the given directory to classpath
     *
     * @param directory
     * @throws IOException
     */
     private void addDirToClasspath(File directory) throws IOException {
    	File[] files = directory.listFiles();
        for (int i = 0; i < files.length; i++) {
            loadJar(files[i]);
        }
    }
    
    /**
     * Add URL to CLASSPATH
     *
     * @param url URL
     * @throws IOException IOException
     */
    private void addURLToClassLoader(URL url, URLClassLoader classLoader) throws IOException {
        if (url.toString().endsWith(".jar") || url.toString().endsWith(".war")) {
            logger.info("Adding Plugin from URL: " + url.toString());
            URL urls[] = classLoader.getURLs();
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
                method.invoke(classLoader, new Object[]{url});
            } catch (Throwable t) {
                t.printStackTrace();
                logger.error("Error, could not add URL to system classloader");
            }
        }
    }
	
	@Override
	public Class<?> loadClass(String name) throws ClassNotFoundException {
		return super.loadClass(name);
	}
	
	@Override
	protected Class<?> findClass(String className) throws ClassNotFoundException {
		Class jarClass = null;
		
		for (String key : loadedJars.keySet()) {
			logger.info("Attempting to load class " + className + " from Jar: " + key);
			ClassLoader classLoader = loadedJars.get(key);
			try {
				jarClass = classLoader.loadClass(className);
			} catch (ClassNotFoundException cnfe) {
				cnfe.printStackTrace();
			}
			logger.info("Finished attempting to load class: " + jarClass);
		}
		
		return jarClass;
	}
	
}
