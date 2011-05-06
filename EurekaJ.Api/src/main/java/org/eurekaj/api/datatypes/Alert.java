package org.eurekaj.api.datatypes;

import org.eurekaj.api.enumtypes.AlertStatus;
import org.eurekaj.api.enumtypes.AlertType;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/6/11
 * Time: 12:15 AM
 * To change this template use File | Settings | File Templates.
 */
public interface Alert {

    public String getAlertName();

    public String getGuiPath();

    public boolean isActivated();

    public Double getErrorValue();

    public Double getWarningValue();

    public AlertType getSelectedAlertType();

    public long getAlertDelay();

    public AlertStatus getStatus();

    public List<String> getSelectedEmailSenderList();
}
