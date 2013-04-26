package org.eurekaj.api.util;

public class DoubleParser {

	public static Double parseDoubleFromString(String input, Double fallbackValue) {
		Double retDouble = null;
		
		try {
			retDouble = Double.parseDouble(input);
		} catch (NumberFormatException nfe) {
			retDouble = fallbackValue;
		}
		
		return retDouble;
	}
}
