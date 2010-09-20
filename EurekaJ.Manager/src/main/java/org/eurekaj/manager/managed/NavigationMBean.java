package org.eurekaJ.manager.managed;

import org.eurekaJ.manager.service.TreeMenuService;

public class NavigationMBean  implements AlertableMBean {
	private UserMBean userMBean;
	private TreeMenuService treeMenuService;
	
	public TreeMenuService getTreeMenuService() {
		return treeMenuService;
	}
	
	public UserMBean getUserMBean() {
		return userMBean;
	}
	
	public void setUserMBean(UserMBean userMBean) {
		this.userMBean = userMBean;
		this.userMBean.addMBeanToAlertList(this);
	}
	
	public void setTreeMenuService(TreeMenuService treeMenuService) {
		this.treeMenuService = treeMenuService;
	}
	
	public String navigateToInstrumentation() {
		return "navigateTo.instrumentation";
	}
	
	public String navigateToGroupInstrumentation() {
		return "navigateTo.groupInstrumentation";
	}
	
	@Override
	public void processPathChange() {
		//No processing as of yet. 
	}
}
