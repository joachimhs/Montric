package org.eurekaj.simpledb.datatypes;

import com.amazonaws.services.simpledb.model.Attribute;
import com.amazonaws.services.simpledb.model.ReplaceableAttribute;
import org.eurekaj.api.datatypes.LiveStatistics;
import org.eurekaj.simpledb.SimpleDBUtil;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 5/7/11
 * Time: 11:36 AM
 * To change this template use File | Settings | File Templates.
 */
public class SimpleDBLiveStatistics implements LiveStatistics, Comparable<LiveStatistics> {
    private String guiPath;
	private Long timeperiod;
    private Double value;

    public SimpleDBLiveStatistics() {
    }

    public SimpleDBLiveStatistics(String guiPath, Long timeperiod, Double value) {
        this.guiPath = guiPath;
        this.timeperiod = timeperiod;
        this.value = value;
    }

    public SimpleDBLiveStatistics(List<Attribute> attributeList) {
        Map<String, String> attributeMap = SimpleDBUtil.getAttributesAStringMap(attributeList);

        setGuiPath(attributeMap.get("guiPath"));
        setTimeperiod(attributeMap.get("timeperiod"));
        setValue(attributeMap.get("value"));
    }

    public List<ReplaceableAttribute> getAmazonSimpleDBAttribute() {
        List<ReplaceableAttribute> replaceableAttributeList = new ArrayList<ReplaceableAttribute>();
        replaceableAttributeList.add(new ReplaceableAttribute("guiPath", this.getGuiPath(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("timeperiod", SimpleDBUtil.getSimpleDBTimestamp(this.getTimeperiod()), true));
        replaceableAttributeList.add(new ReplaceableAttribute("value", this.getValue().toString(), true));

        return replaceableAttributeList;
    }

    public String getGuiPath() {
        return guiPath;
    }

    public void setGuiPath(String guiPath) {
        this.guiPath = guiPath;
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

    public Double getValue() {
        return value;
    }

    public void setValue(Double value) {
        this.value = value;
    }

    public void setValue(String value) {
        if (value == null) {
            this.value = null;
        } else {
            try {
                this.value = Double.parseDouble(value);
            } catch (NumberFormatException nfe) {
                this.value = null;
            }
        }
    }

    public int compareTo(LiveStatistics other) {
		if (other == null || other.getTimeperiod() == null) {
			return 1;
		}

		if (this.getTimeperiod() == null) {
			return -1;
		}

		return this.getTimeperiod().compareTo(other.getTimeperiod());
	}
}
