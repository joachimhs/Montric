package org.eurekaj.api.util;

public class IntegerParser {

	public static Integer parseIntegerFromString(String input, Integer fallbackValue) {
		Integer retInt = null;
		
		try {
			retInt = Integer.parseInt(input);
		} catch (NumberFormatException nfe) {
			retInt = fallbackValue;
		}
		
		return retInt;
	}
}
