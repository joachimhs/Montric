package org.eurekaj.api.util;

import java.util.ArrayList;
import java.util.List;

public class ListToString {

    public static String convertFromArray(Object[] array, String delimeter) {
        if (array.length == 0) {
            return "";
        }

        StringBuffer sb = new StringBuffer();
        sb.append("[");

        for (int i = 0; i < array.length; i++) {
            if (i > 0)  {
                sb.append(delimeter);
            }

            if (array[i] instanceof String) {
                sb.append("'").append(array[i]).append("'");
            } else {
                sb.append(array[i]);
            }
        }

        sb.append("]");
        return sb.toString();
    }
    
    public static String convertFromListToJsonString(List<String> list, String delimeter) {
        if (list.size() == 0) {
            return "";
        }

        StringBuffer sb = new StringBuffer();
        sb.append("[");

        for (int i = 0; i < list.size(); i++) {
            if (i > 0)  {
                sb.append(delimeter);
            }

            if (list.get(i) instanceof String) {
                sb.append("\"").append(list.get(i)).append("\"");
            } else {
                sb.append(list.get(i));
            }
        }

        sb.append("]");
        return sb.toString();
    }

    public static String convertToCassandraMap(Object[] array) {
        if (array.length == 0) {
            return "";
        }

        StringBuffer sb = new StringBuffer();
        sb.append("{");

        for (int i = 0; i < array.length; i++) {
            if (array[i] != null) {
                if (i > 0)  {
                    sb.append(",");
                }

                sb.append(i).append(":");
                if (array[i] instanceof String) {
                    sb.append("'").append(array[i]).append("'");
                } else {
                    sb.append(array[i]);
                }
            }
        }

        sb.append("}");
        return sb.toString();
    }

    public static String[] convertToArray(String listString, String delimeter) {
        return listString.split(delimeter);
    }

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

    public static List<String> convertToList(String listString, String delimeter) {
        List<String> retList = new ArrayList<String>();
        for (String item : listString.split(delimeter)) {
            retList.add(item);
        }

        return retList;
    }

    public static String convertFromCassandraList(List<String> list, String delimeter) {
        if (list == null || list.isEmpty()) {
            return "[]";
        }

        StringBuffer sb = new StringBuffer();
        sb.append("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0)  {
                sb.append(delimeter);
            }

            sb.append("'").append(list.get(i)).append("'");
        }
        sb.append("]");
        return sb.toString();
    }

}
