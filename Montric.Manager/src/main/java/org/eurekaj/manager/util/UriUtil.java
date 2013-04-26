package org.eurekaj.manager.util;

/**
 * Created with IntelliJ IDEA.
 * User: joahaa
 * Date: 1/30/13
 * Time: 3:36 PM
 * To change this template use File | Settings | File Templates.
 */
public class UriUtil {
    public static String getIdFromUri(String uri, String key) {
        String[] uriParts = uri.split("/");
        String id = null;
        int idPart = -1;
        for (int i = 0; i < uriParts.length; i++) {
            String part = uriParts[i];
            if (part.equals(key) && uriParts.length > (i + i)) {
                idPart = i+1;
                break;
            }
        }

        if (idPart > 0 && idPart < uriParts.length) {
            id = uriParts[idPart];
        }
        return id;
    }
}
