package org.eurekaj.simpledb;

import com.amazonaws.services.simpledb.model.Attribute;

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

    public static Map<String, String> getAttributesAStringMap(List<Attribute> attributeList) {
        Map<String, String> attributeMap = new TreeMap<String, String>();
        for (Attribute attribute : attributeList) {
            attributeMap.put(attribute.getName(), attribute.getValue());
        }

        return attributeMap;
    }
}
