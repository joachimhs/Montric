package org.eurekaj.simpledb.datatypes;

import com.amazonaws.services.simpledb.model.Attribute;
import com.amazonaws.services.simpledb.model.ReplaceableAttribute;
import org.eurekaj.api.datatypes.TriggeredAlert;
import org.eurekaj.simpledb.SimpleDBUtil;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 5/7/11
 * Time: 11:42 AM
 * To change this template use File | Settings | File Templates.
 */
public class SimpleDBTriggeredAlert implements TriggeredAlert {
    private String alertName;
    private Long timeperiod;
    private Double errorValue;
	private Double warningValue;
    private Double alertValue;
    private Long triggeredTimeperiod;

    public SimpleDBTriggeredAlert(TriggeredAlert triggeredAlert) {
        this.alertName = triggeredAlert.getAlertName();
        this.timeperiod = triggeredAlert.getTimeperiod();
        this.errorValue = triggeredAlert.getErrorValue();
        this.warningValue = triggeredAlert.getWarningValue();
        this.alertValue = triggeredAlert.getAlertValue();
        this.triggeredTimeperiod = triggeredAlert.getTimeperiod();
    }

    public SimpleDBTriggeredAlert() {
    }

    public SimpleDBTriggeredAlert(List<Attribute> attributeList) {
        Map<String, String> attributeMap = SimpleDBUtil.getAttributesAStringMap(attributeList);

        this.setAlertName(attributeMap.get("alertName"));
        this.setTimeperiod(attributeMap.get("timeperiod"));
        this.setErrorValue(attributeMap.get("errorValue"));
        this.setWarningValue((attributeMap.get("warningValue")));
        this.setAlertValue(attributeMap.get("alertValue"));
        this.setTriggeredTimeperiod(attributeMap.get("triggeredTimeperiod"));
    }

    public List<ReplaceableAttribute> getAmazonSimpleDBAttribute() {
        List<ReplaceableAttribute> replaceableAttributeList = new ArrayList<ReplaceableAttribute>();
        replaceableAttributeList.add(new ReplaceableAttribute("alertName", this.getAlertName(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("timeperiod", this.getTimeperiod().toString(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("errorValue", this.getErrorValue().toString(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("warningValue", this.getWarningValue().toString(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("alertValue", this.getAlertValue().toString(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("triggeredTimeperiod", this.getTriggeredTimeperiod().toString(), true));

        return replaceableAttributeList;
    }

    public String getAlertName() {
        return alertName;
    }

    public void setAlertName(String alertName) {
        this.alertName = alertName;
    }

    public Long getTimeperiod() {
        return timeperiod;
    }

    public void setTimeperiod(Long timeperiod) {
        this.timeperiod = timeperiod;
    }

    public void setTimeperiod(String timeperiod) {
        if (timeperiod == null) {
            this.timeperiod = null;
        } else {
            try {
                this.timeperiod = Long.parseLong(timeperiod);
            } catch (NumberFormatException nfe) {
                this.timeperiod = null;
            }
        }
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

    public Double getAlertValue() {
        return alertValue;
    }

    public void setAlertValue(Double alertValue) {
        this.alertValue = alertValue;
    }

    public void setAlertValue(String alertValue) {
        if (alertValue == null) {
            this.alertValue = null;
        } else {
            try {
                this.alertValue = Double.parseDouble(alertValue);
            } catch (NumberFormatException nfe) {
                this.alertValue = null;
            }
        }
    }

    public Long getTriggeredTimeperiod() {
        return triggeredTimeperiod;
    }

    public void setTriggeredTimeperiod(Long triggeredTimeperiod) {
        this.triggeredTimeperiod = triggeredTimeperiod;
    }

    public void setTriggeredTimeperiod(String triggeredTimeperiod) {
        if (triggeredTimeperiod == null) {
            this.triggeredTimeperiod = null;
        } else {
            try {
                this.triggeredTimeperiod = Long.parseLong(triggeredTimeperiod);
            } catch (NumberFormatException nfe) {
                this.triggeredTimeperiod = null;
            }
        }
    }
}
