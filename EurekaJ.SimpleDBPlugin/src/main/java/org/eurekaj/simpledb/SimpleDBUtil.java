package org.eurekaj.simpledb;

import com.amazonaws.services.simpledb.model.Attribute;

import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 5/7/11
 * Time: 10:55 PM
 * To change this template use File | Settings | File Templates.
 */
public class SimpleDBUtil {

    private static DecimalFormat timeperiodFormat = new DecimalFormat();

    static {
        timeperiodFormat.setMaximumFractionDigits(0);
        timeperiodFormat.setMinimumFractionDigits(0);
        timeperiodFormat.setMinimumIntegerDigits(10);
        timeperiodFormat.setMaximumFractionDigits(10);
        timeperiodFormat.setGroupingSize(10);
        timeperiodFormat.setDecimalSeparatorAlwaysShown(false);
    }

    public static Map<String, String> getAttributesAStringMap(List<Attribute> attributeList) {
        Map<String, String> attributeMap = new TreeMap<String, String>();
        for (Attribute attribute : attributeList) {
            attributeMap.put(attribute.getName(), attribute.getValue());
        }

        return attributeMap;
    }

    public static String getStringListAsString(List<String> stringList) {
        StringBuilder sb = new StringBuilder();

        for (String string : stringList) {
            sb.append(string).append(",");
        }

        String concatinatedString = sb.toString();
        if (concatinatedString.endsWith(",")) {
            concatinatedString = concatinatedString.substring(0, concatinatedString.length() -1);
        }

        return concatinatedString;
    }

    public static List<String> getCommaseperatedStringAsList(String csvString, String delimiter) {
        List<String> stringList = new ArrayList<String>();

        if (csvString != null && csvString.contains(",")) {
            String[] emails = csvString.split(delimiter);
            for (String email : emails) {
                stringList.add(email);
            }
        } else if (csvString != null && !csvString.contains(",")) {
            stringList.add(csvString);
        }

        return stringList;
    }

    public static String getSimpleDBTimestamp(Long timeperiod) {
        return timeperiodFormat.format(timeperiod);
    }
}
