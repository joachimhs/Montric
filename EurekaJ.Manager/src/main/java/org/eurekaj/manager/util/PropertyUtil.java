package org.eurekaj.manager.util;

import java.util.Properties;

public class PropertyUtil {

	/**
	 * This method extracts all properties that starts with the specifies string and returns a new Property object
	 * containing only the matching properties
	 * @param startingWith - The string to match each property key with
	 * @param propertySource - The property source
	 * @return - a new property set containing the new set of properties extracted from propertySource
	 */
	public static Properties extractPropertiesStartingWith(String startingWith, Properties propertySource) {
		Properties propertiesMatching = new Properties();
		
		for (String property : propertySource.stringPropertyNames()) {
			if (property.startsWith(startingWith)) {
				propertiesMatching.put(property, propertySource.get(property));
			}
		}
		
		return propertiesMatching;
	}
}
