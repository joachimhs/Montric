package org.eurekaJ.manager.perst.alert;

import com.sleepycat.persist.model.Entity;
import com.sleepycat.persist.model.PrimaryKey;

@Entity
public class Alert implements Comparable<Alert>{
	public static final int IDLE = 0;
	public static final int NORMAL = 1;
	public static final int WARNING = 2;
	public static final int CRITICAL = 3;
	
	public static final int ALERT_ON_AVG_EXECTIME = 10;
	public static final int ALERT_ON_CALLS = 11;
	public static final int ALERT_ON_VALUE = 12;
	public static final int ALERT_ON_TOTAL_EXECTIME = 13;
	
	public static final int GREATER_THAN = 20;
	public static final int LESS_THAN = 21;
	public static final int EQUALS = 22;
	
	public static final int UNKNOWN = -1;
	
	private int alertOn = ALERT_ON_AVG_EXECTIME;
	@PrimaryKey private String guiPath;
	private boolean activated;
	private Double errorValue;
	private Double warningValue;
	private int selectedAlertType = GREATER_THAN;
	private long alertDelay = 0;
	private int status = NORMAL;
	
	public Alert() {
		super();
	}
	
	public static String getStringValueForEnumtypes(int enumtype) {
		String retVal = "unknown";
		
		if (enumtype == IDLE) {
			retVal = "idle";
		} else if (enumtype == NORMAL) {
			retVal = "normal";
		} else if (enumtype == WARNING) {
			retVal = "warning";
		} else if (enumtype == CRITICAL) {
			retVal = "critical";
		} else if (enumtype == ALERT_ON_AVG_EXECTIME) {
			retVal = "alert_on_avg_exectype";
		} else if (enumtype == ALERT_ON_CALLS) {
			retVal = "alert_on_calls_per_interval";
		} else if (enumtype == ALERT_ON_TOTAL_EXECTIME) {
			retVal = "alert_on_total_exectype";
		} else if (enumtype == ALERT_ON_VALUE) {
			retVal = "alert_on_value";
		} else if (enumtype == GREATER_THAN) {
			retVal = "greater_than";
		} else if (enumtype == LESS_THAN) {
			retVal = "less_than";
		} else if (enumtype == EQUALS) {
			retVal = "equals";
		}
		
		return retVal;
	}
	
	public static int getIntValueForStringvalue(String value) {
		int retVal = UNKNOWN;
		
		if (value.equals("idle")) {
			retVal = IDLE;
		} else if (value.equals("normal")) {
			retVal = NORMAL;
		} else if (value.equals("warning")) {
			retVal = WARNING;
		} else if (value.equals("critical")) {
			retVal = CRITICAL;
		} else if (value.equals("alert_on_avg_exectype")) {
			retVal = ALERT_ON_AVG_EXECTIME;
		} else if (value.equals("alert_on_calls_per_interval")) {
			retVal = ALERT_ON_CALLS;
		} else if (value.equals("alert_on_total_exectype")) {
			retVal = ALERT_ON_TOTAL_EXECTIME;
		} else if (value.equals("alert_on_value")) {
			retVal = ALERT_ON_VALUE;
		} else if (value.equals("greater_than")) {
			retVal = GREATER_THAN;
		} else if (value.equals("less_than")) {
			retVal = LESS_THAN;
		} else if (value.equals("equals")) {
			retVal = EQUALS;
		}
		
		return retVal;
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

	public int getSelectedAlertType() {
		return selectedAlertType;
	}

	public void setSelectedAlertType(int selectedAlertType) {
		this.selectedAlertType = selectedAlertType;
	}

	public long getAlertDelay() {
		return alertDelay;
	}

	public void setAlertDelay(long alertDelay) {
		this.alertDelay = alertDelay;
	}
	
	public int getStatus() {
		return status;
	}
	
	public int getAlertOn() {
		return alertOn;
	}
	
	public void setAlertOn(int alertOn) {
		this.alertOn = alertOn;
	}
	
	public String getStatusString() {
		if (status == 0) {
			return "IDLE";
		} else if (status == 1) {
			return "NORMAL";
		} else if (status == 2) {
			return "WARNING";
		} else if (status == 3) {
			return "CRITICAL";
		} else {
			return "UNKNOWN";
		}
	}
	
	public void setStatus(int status) {
		this.status = status;
	}
	
	public void changeStatusToIdle() {
		this.status = IDLE;
	}
	public void changeStatusToNormal() {
		this.status = NORMAL;
	}
	
	public void changeStatusToWARNING() {
		this.status = WARNING;
	}
	
	public void changeStatusToCRITICAL() {
		this.status = CRITICAL;
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
