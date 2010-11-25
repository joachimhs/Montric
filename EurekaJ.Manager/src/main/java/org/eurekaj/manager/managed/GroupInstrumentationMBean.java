package org.eurekaj.manager.managed;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.faces.event.ActionEvent;
import javax.faces.model.SelectItem;

import org.eurekaj.manager.berkeley.treemenu.TreeMenuNode;
import org.eurekaj.manager.perst.statistics.GroupedStatistics;
import org.eurekaj.manager.service.TreeMenuService;

public class GroupInstrumentationMBean  implements AlertableMBean {
	private UserMBean userMBean;
	private TreeMenuService treeMenuService;
	List<SelectItem> groupList;
	List<String> selectedGroupList;
	List<GroupedStatistics> storedGroupedStatistics;
	
	public GroupInstrumentationMBean() {
		groupList = new ArrayList<SelectItem>();
		selectedGroupList = new ArrayList<String>();
		storedGroupedStatistics = new ArrayList<GroupedStatistics>();
	}
	
	public UserMBean getUserMBean() {
		return userMBean;
	}
	
	public void setUserMBean(UserMBean userMBean) {
		this.userMBean = userMBean;
		this.userMBean.addMBeanToAlertList(this);
	}
	
	public TreeMenuService getTreeMenuService() {
		return treeMenuService;
	}
	
	public void setTreeMenuService(TreeMenuService treeMenuService) {
		this.treeMenuService = treeMenuService;
	}
		
	public List<SelectItem> getAvailableGroups() {
		List<TreeMenuNode> menuNodeList = treeMenuService.getTreeMenu();
		List<SelectItem> groupList = new ArrayList<SelectItem>();
		HashMap<String, String> possibleNodeHash = new HashMap<String, String>();
		
		for (TreeMenuNode node : menuNodeList) {
			String guiPath = node.getGuiPath();
			while (guiPath.contains(":")) {
				guiPath = guiPath.substring(0, guiPath.lastIndexOf(":"));
				String inHashStr = possibleNodeHash.get(guiPath);
				if (inHashStr == null) {
					possibleNodeHash.put(guiPath, guiPath);
					groupList.add(new SelectItem(guiPath, guiPath));
				}
			}
		}
		
		return groupList;
	}
	
	public void processGroupSelection(ActionEvent event) {
		updateGroupSelection();
	}
	
	public void updateGroupSelection() {
		String selectedPath = userMBean.getSelectedPath();
		selectedGroupList = new ArrayList<String>();
		List<TreeMenuNode> menuNodeList = treeMenuService.getTreeMenu();
		groupList = new ArrayList<SelectItem>();
		
		for (TreeMenuNode node : menuNodeList) {
			String guiPath = node.getGuiPath();
			if (guiPath.startsWith(selectedPath)) {
				groupList.add(new SelectItem(guiPath, guiPath));
			}
		}
		
		List<GroupedStatistics> storedGroups = getStoredGroupedStatistics();
		for (GroupedStatistics storedGroup : storedGroups) {
			if (selectedPath.equals(storedGroup.getSourceGuiPath())) {
				//Transfer stored groups to the picked list
				selectedGroupList.addAll(storedGroup.getGroupedPathList());
				groupList.removeAll(storedGroup.getGroupedPathList());
			}
		}
	}
	
	public List<SelectItem> getGroupList() {
		return groupList;
	}
	
	public void setGroupList(List<SelectItem> groupList) {
		this.groupList = groupList;
	}
	
	public int getGroupListCount() {
		return this.groupList.size();
	}
	
	public List<String> getSelectedGroupList() {
		return selectedGroupList;
	}
	
	public List<GroupedStatistics> getStoredGroupedStatistics() {
		storedGroupedStatistics = treeMenuService.getGroupedStatistics();
		if (storedGroupedStatistics == null) {
			storedGroupedStatistics = new ArrayList<GroupedStatistics>();
		}
		return storedGroupedStatistics;
	}
	
	public void setStoredGroupedStatistics(
			List<GroupedStatistics> storedGroupedStatistics) {
		this.storedGroupedStatistics = storedGroupedStatistics;
	}
	
	public void setSelectedGroupList(List<String> selectedGroupList) {
		this.selectedGroupList = selectedGroupList;
		System.out.println("Selected group list: " + this.selectedGroupList);
	}
	
	public void persistGroupInstrumentation(ActionEvent event) {
		GroupedStatistics gs = new GroupedStatistics();
		gs.setSourceGuiPath(userMBean.getSelectedPath());
		for (String selectPath : selectedGroupList) {
			gs.getGroupedPathList().add(selectPath);
		}
		treeMenuService.persistGroupInstrumentation(gs);
	}
	
	@Override
	public void processPathChange() {
		updateGroupSelection();
	}
}
