package org.eurekaj.manager.util;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 5/7/11
 * Time: 11:02 AM
 * To change this template use File | Settings | File Templates.
 */
public class DatabasePluginUtil {

    public static String getDatabasePluginName() {
        String pluginName = System.getProperty("PARAM2");
        if (pluginName == null || pluginName.length() == 0) {
            pluginName = System.getProperty("eurekaj.db.type", "Berkeley");
            System.setProperty("eurekaj.db.type", "Berkeley");
        }

        return pluginName;
    }
}
