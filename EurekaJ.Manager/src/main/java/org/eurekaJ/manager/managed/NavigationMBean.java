package org.eurekaJ.manager.managed;

import org.eurekaJ.manager.service.TreeMenuService;

public class NavigationMBean {
	
	private TreeMenuService treeMenuService;
	
	public TreeMenuService getTreeMenuService() {
		return treeMenuService;
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
}
