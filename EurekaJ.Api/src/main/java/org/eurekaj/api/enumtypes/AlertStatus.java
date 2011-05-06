package org.eurekaj.api.enumtypes;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/6/11
 * Time: 12:06 AM
 * To change this template use File | Settings | File Templates.
 */
public enum AlertStatus {
    IDLE("idle"),
    NORMAL("normal"),
    WARNING("warning"),
    CRITICAL("critical");

    private final String statusName;

    AlertStatus(String statusName) {
        this.statusName = statusName;
    }

    public String getStatusName() {
        return statusName;
    }

    public static AlertStatus fromValue(String statusName) {
        for (AlertStatus alertStatus: AlertStatus.values()) {
            if (alertStatus.getStatusName().equals(statusName)) {
                return alertStatus;
            }
        }
        throw new IllegalArgumentException(statusName);
    }
}
