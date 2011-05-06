package org.eurekaj.manager.datatypes;

import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.enumtypes.AlertStatus;
import org.eurekaj.api.enumtypes.AlertType;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/6/11
 * Time: 10:25 AM
 * To change this template use File | Settings | File Templates.
 */
public class ManagerAlert implements Alert {
    private String alertName;
    private String guiPath;
	private boolean activated;
	private Double errorValue;
	private Double warningValue;
	private AlertType selectedAlertType = AlertType.GREATER_THAN;
	private long alertDelay = 0;
	private AlertStatus status = AlertStatus.NORMAL;
	private List<String> selectedEmailSenderList = new ArrayList<String>();

    public ManagerAlert() {
    }

    public ManagerAlert(Alert alert) {
        this.alertName = alert.getAlertName();
        this.guiPath = alert.getGuiPath();
        this.activated = alert.isActivated();
        this.errorValue = alert.getErrorValue();
        this.warningValue = alert.getWarningValue();
        this.selectedAlertType = alert.getSelectedAlertType();
        this.alertDelay = alert.getAlertDelay();
        this.status = alert.getStatus();
        this.selectedEmailSenderList = alert.getSelectedEmailSenderList();
    }

    public String getAlertName() {
        return alertName;
    }

    public void setAlertName(String alertName) {
        this.alertName = alertName;
    }

    public String getGuiPath() {
        return guiPath;
    }

    public void setGuiPath(String guiPath) {
        this.guiPath = guiPath;
    }

    public boolean isActivated() {
        return activated;
    }

    public void setActivated(boolean activated) {
        this.activated = activated;
    }

    public Double getErrorValue() {
        return errorValue;
    }

    public void setErrorValue(Double errorValue) {
        this.errorValue = errorValue;
    }

    public Double getWarningValue() {
        return warningValue;
    }

    public void setWarningValue(Double warningValue) {
        this.warningValue = warningValue;
    }

    public AlertType getSelectedAlertType() {
        return selectedAlertType;
    }

    public void setSelectedAlertType(AlertType selectedAlertType) {
        this.selectedAlertType = selectedAlertType;
    }

    public long getAlertDelay() {
        return alertDelay;
    }

    public void setAlertDelay(long alertDelay) {
        this.alertDelay = alertDelay;
    }

    public AlertStatus getStatus() {
        return status;
    }

    public void setStatus(AlertStatus status) {
        this.status = status;
    }

    public List<String> getSelectedEmailSenderList() {
        return selectedEmailSenderList;
    }

    public void setSelectedEmailSenderList(List<String> selectedEmailSenderList) {
        this.selectedEmailSenderList = selectedEmailSenderList;
    }
}
