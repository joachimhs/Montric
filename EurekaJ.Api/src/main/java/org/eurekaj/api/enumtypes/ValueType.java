package org.eurekaj.api.enumtypes;

public enum ValueType {

    AGGREGATE("aggregate"),
    VALUE("value"),
    AVERAGE("average");

    private final String value;

    ValueType(String v) {
        value = v;
    }

    public String value() {
        return value;
    }

    public static ValueType fromValue(String v) {
        for (ValueType c: ValueType.values()) {
            if (c.value.equals(v)) {
                return c;
            }
        }
        throw new IllegalArgumentException(v);
    }

}
