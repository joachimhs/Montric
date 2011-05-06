package org.eurekaj.api.enumtypes;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/6/11
 * Time: 12:07 AM
 * To change this template use File | Settings | File Templates.
 */
public enum AlertType {
    GREATER_THAN("greater_than"),
    EQUALS("equals"),
    LESS_THAN("less_than");

    private final String typeName;

    AlertType(String typeName) {
        this.typeName = typeName;
    }

    public String getTypeName() {
        return typeName;
    }

    public static AlertType fromValue(String typeName) {
        for (AlertType c: AlertType.values()) {
            if (c.getTypeName().equals(typeName)) {
                return c;
            }
        }
        throw new IllegalArgumentException(typeName);
    }
}
