package org.eurekaj.api.util;

import java.util.List;

public class ListToString {

	public static String convertFromList(List<String> list, String delimeter) {
		if (list == null || list.isEmpty()) {
			return "";
		}
		
		StringBuffer sb = new StringBuffer();
		
		for (int i = 0; i < list.size(); i++) { 
		    if (i > 0)  {
		        sb.append(delimeter);
		    }

		    sb.append(list.get(i)); 
		}
		
		return sb.toString();
	}
}
