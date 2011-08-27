/**
    EurekaJ Profiler - http://eurekaj.haagen.name
    
    Copyright (C) 2010-2011 Joachim Haagen Skeie

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
package org.eurekaj.simpledb.datatypes;

import com.amazonaws.services.simpledb.model.Attribute;
import com.amazonaws.services.simpledb.model.ReplaceableAttribute;
import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.enumtypes.AlertStatus;
import org.eurekaj.api.enumtypes.AlertType;
import org.eurekaj.simpledb.SimpleDBUtil;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 5/7/11
 * Time: 11:38 AM
 * To change this template use File | Settings | File Templates.
 */
public class SimpleDBAlert implements Comparable<Alert>, Alert {
    private String alertName;
    private String guiPath;
	private boolean activated;
	private Double errorValue;
	private Double warningValue;
	private AlertType selectedAlertType = AlertType.GREATER_THAN;
	private long alertDelay = 0;
	private AlertStatus status = AlertStatus.NORMAL;
	private List<String> selectedEmailSenderList = new ArrayList<String>();

    public SimpleDBAlert() {
    }

    public SimpleDBAlert(Alert alert) {
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

    public SimpleDBAlert(List<Attribute> attributeList) {
        Map<String, String> attributeMap = SimpleDBUtil.getAttributesAStringMap(attributeList);

        setAlertName(attributeMap.get("alertName"));
        setGuiPath(attributeMap.get("guiPath"));
        setActivated(attributeMap.get("activated"));
        setErrorValue(attributeMap.get("errorValue"));
        setWarningValue(attributeMap.get("warningValue"));
        setSelectedAlertType(attributeMap.get("selectedAlertType"));
        setAlertDelay(attributeMap.get("alertDelay"));
        setStatus(attributeMap.get("status"));
        setSelectedEmailSenderList(SimpleDBUtil.getCommaseperatedStringAsList(attributeMap.get("selectedEmailSenderList"), ","));
    }

    public List<ReplaceableAttribute> getAmazonSimpleDBAttribute() {
        List<ReplaceableAttribute> replaceableAttributeList = new ArrayList<ReplaceableAttribute>();
        replaceableAttributeList.add(new ReplaceableAttribute("alertName", this.getAlertName(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("guiPath", this.getGuiPath(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("activated", new Boolean(this.isActivated()).toString(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("errorValue", this.getErrorValue().toString(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("warningValue", this.getWarningValue().toString(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("selectedAlertType", this.getSelectedAlertType().getTypeName(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("alertDelay", new Long(this.getAlertDelay()).toString(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("status", this.getStatus().getStatusName(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("selectedEmailSenderList", SimpleDBUtil.getStringListAsString(this.selectedEmailSenderList), true));

        return replaceableAttributeList;
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

    public void setActivated(String activated) {
        this.activated = new Boolean(activated);
    }

    public Double getErrorValue() {
        return errorValue;
    }

    public void setErrorValue(Double errorValue) {
        this.errorValue = errorValue;
    }

    public void setErrorValue(String errorValue) {
        if (errorValue == null) {
            this.errorValue = null;
        } else {
            try {
                this.errorValue = Double.parseDouble(errorValue);
            } catch (NumberFormatException nfe) {
                this.errorValue = null;
            }
        }
    }

    public Double getWarningValue() {
        return warningValue;
    }

    public void setWarningValue(Double warningValue) {
        this.warningValue = warningValue;
    }

    public void setWarningValue(String warningValue) {
        if (warningValue == null) {
            this.warningValue = null;
        } else {
            try {
                this.warningValue = Double.parseDouble(warningValue);
            } catch (NumberFormatException nfe) {
                this.warningValue = null;
            }
        }
    }

    public AlertType getSelectedAlertType() {
        return selectedAlertType;
    }

    public void setSelectedAlertType(AlertType selectedAlertType) {
        this.selectedAlertType = selectedAlertType;
    }

    public void setSelectedAlertType(String selectedAlertType) {
        if (selectedAlertType == null) {
            this.selectedAlertType = AlertType.GREATER_THAN;
        } else {
            this.selectedAlertType = AlertType.fromValue(selectedAlertType);
        }
    }

    public long getAlertDelay() {
        return alertDelay;
    }

    public void setAlertDelay(long alertDelay) {
        this.alertDelay = alertDelay;
    }

    public void setAlertDelay(String alertDelay) {
        if (alertDelay == null) {
            this.alertDelay = 0;
        } else {
            try {
                this.alertDelay = Long.parseLong(alertDelay);
            } catch (NumberFormatException nfe) {
                this.alertDelay = 0;
            }
        }
    }

    public AlertStatus getStatus() {
        return status;
    }

    public void setStatus(AlertStatus status) {
        this.status = status;
    }

    public void setStatus(String status) {
        if (status == null) {
            this.status = AlertStatus.IDLE;
        } else {
            this.status = AlertStatus.fromValue(status);
        }
    }

    public List<String> getSelectedEmailSenderList() {
        return selectedEmailSenderList;
    }

    public void setSelectedEmailSenderList(List<String> selectedEmailSenderList) {
        this.selectedEmailSenderList = selectedEmailSenderList;
    }

    public int compareTo(Alert other) {
		if (other == null || other.getGuiPath() == null) {
			return 1;
		}

		if (this.getGuiPath() == null) {
			return -1;
		}

		return this.getGuiPath().compareTo(other.getGuiPath());
	}
}
