package org.eurekaj.api.enumtypes;

public enum UnitType {

    NS("ns"),
    MS("ms"),
    S("s"),
    N("n");

    private final String unit;

    UnitType(String unit) {
        this.unit = unit;
    }

    public String value() {
        return unit;
    }

    public static UnitType fromValue(String v) {
        for (UnitType c: UnitType.values()) {
            if (c.unit.equals(v)) {
                return c;
            }
        }
        throw new IllegalArgumentException(v);
    }

}
