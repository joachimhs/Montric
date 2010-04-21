package org.eurekaJ.manager.managed;

import java.util.ArrayList;
import java.util.List;

public class UserMBean {
	private Long customerID;
	private String selectedPath;
	private String selectedInstrumentationGroup;
	private String selectedAlertGroup;
	private List<AlertableMBean> mBeansToAlertList;
	
	public UserMBean() {
		super();
		mBeansToAlertList = new ArrayList<AlertableMBean>();
	}

	public Long getCustomerID() {
		return customerID;
	}

	public void setCustomerID(Long customerID) {
		this.customerID = customerID;
	}

	public String getSelectedPath() {
		return selectedPath;
	}

	public void setSelectedPath(String selectedPath) {
		if (this.selectedPath != null && selectedPath != null 
				&& !this.selectedPath.equals(selectedPath)) {
			alertAllMBeans();
		}
		this.selectedPath = selectedPath;
	}

	public String getSelectedInstrumentationGroup() {
		return selectedInstrumentationGroup;
	}

	public void setSelectedInstrumentationGroup(String selectedInstrumentationGroup) {
		if (this.selectedInstrumentationGroup != null && selectedInstrumentationGroup != null
				&& !this.selectedInstrumentationGroup.equals(selectedInstrumentationGroup)) {
			alertAllMBeans();
		}
		this.selectedInstrumentationGroup = selectedInstrumentationGroup;
	}

	public String getSelectedAlertGroup() {
		return selectedAlertGroup;
	}

	public void setSelectedAlertGroup(String selectedAlertGroup) {
		if (this.selectedAlertGroup != null && selectedAlertGroup != null
				&& !this.selectedAlertGroup.equals(selectedAlertGroup)) {
			alertAllMBeans();
		}
		this.selectedAlertGroup = selectedAlertGroup;
	}
	
	public void addMBeanToAlertList(AlertableMBean mbeanToAlert) {
		if (!mBeansToAlertList.contains(mbeanToAlert)) {
			mBeansToAlertList.add(mbeanToAlert);
		}
	}
	
	public void alertAllMBeans() {
		for (AlertableMBean mBeanToAlert: mBeansToAlertList) {
			mBeanToAlert.processPathChange();
		}
	}
	
}
