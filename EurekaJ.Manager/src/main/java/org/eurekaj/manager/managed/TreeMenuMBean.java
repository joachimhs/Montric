package org.eurekaJ.manager.managed;

import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.Hashtable;
import java.util.List;

import javax.faces.event.ActionEvent;
import javax.faces.event.ValueChangeEvent;

import org.apache.log4j.Logger;
import org.eurekaJ.manager.berkeley.statistics.LiveStatistics;
import org.eurekaJ.manager.berkeley.treemenu.TreeMenuNode;
import org.eurekaJ.manager.model.frontend.TreeMenuNodeData;
import org.eurekaJ.manager.perst.statistics.GroupedStatistics;
import org.eurekaJ.manager.service.TreeMenuService;
import org.jsflot.components.FlotChartClickedEvent;
import org.jsflot.components.FlotChartDraggedEvent;
import org.jsflot.xydata.XYDataList;
import org.jsflot.xydata.XYDataPoint;
import org.jsflot.xydata.XYDataSetCollection;
import org.richfaces.component.html.HtmlMenuItem;
import org.richfaces.component.html.HtmlTree;
import org.richfaces.event.NodeSelectedEvent;
import org.richfaces.model.TreeNode;
import org.richfaces.model.TreeNodeImpl;

public class TreeMenuMBean implements AlertableMBean {
	private static Logger log = Logger.getLogger(TreeMenuMBean.class);
	private UserMBean userMBean;
	private TreeMenuService treeMenuService;
	private TreeNode<TreeMenuNodeData> rootNode = null;
	private Date menuLastLoaded = null;

	public TreeMenuMBean() {
		
	}

	public UserMBean getUserMBean() {
		return userMBean;
	}
	
	public void setUserMBean(UserMBean userMBean) {
		this.userMBean = userMBean;
	}
	
	public TreeMenuService getTreeMenuService() {
		return treeMenuService;
	}

	public void setTreeMenuService(TreeMenuService treeMenuService) {
		this.treeMenuService = treeMenuService;
	}

	public void loadTree() {
		//Update TreeMenuNode in Database
		rootNode = new TreeNodeImpl<TreeMenuNodeData>();
		
		String custName = "Instrumentations";
		TreeNodeImpl<TreeMenuNodeData> customerNode = new TreeNodeImpl<TreeMenuNodeData>();
		customerNode.setData(new TreeMenuNodeData(custName, custName));
		rootNode.addChild(custName, customerNode);

		List<String> treeList;
		try {
			List<TreeMenuNode> nodeList = treeMenuService.getTreeMenu(); 
			for (TreeMenuNode node : nodeList) {
				String[] keys = node.getGuiPath().split(":");
				TreeNode<TreeMenuNodeData> currNode = customerNode;
				for (String key : keys) {
					TreeNode<TreeMenuNodeData> prevNode = currNode;
					if (prevNode != null) {
						currNode = currNode.getChild(key);
						if (currNode == null) {
							TreeNodeImpl<TreeMenuNodeData> newNode = new TreeNodeImpl<TreeMenuNodeData>();
							newNode.setData(new TreeMenuNodeData(node.getGuiPath(), key));
							prevNode.addChild(key, newNode);
							currNode = prevNode.getChild(key);
						}
					}
				}
			}
			menuLastLoaded = Calendar.getInstance().getTime();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public void processSelection(NodeSelectedEvent event) {
		
		HtmlTree tree = (HtmlTree) event.getComponent();
		String currKey = tree.getRowKey().toString();

		String[] pathVars = currKey.split(":");

		//Remove RootNode Name from Path
		userMBean.setSelectedPath(currKey.substring(pathVars[0].length() + 1));
	}
	
	public void processContextMenu(ActionEvent event) {
		HtmlMenuItem menuItem = (HtmlMenuItem)event.getSource();
        //contextKey = menuItem.getData().toString();
	}



	public TreeNode<TreeMenuNodeData> getRootNode() {
		if (rootNode == null || menuNeedsReload()) {
			loadTree();
		}
		return rootNode;
	}

	private boolean menuNeedsReload() {
		boolean needsReload = false;

		if (menuLastLoaded != null) {
			Calendar tenMinsAgo = Calendar.getInstance();
			tenMinsAgo.add(Calendar.MINUTE, -1);
			if (menuLastLoaded.before(tenMinsAgo.getTime())) {
				needsReload = true;
			}
		} else {
			needsReload = true;
		}

		return needsReload;
	}
	
	@Override
	public void processPathChange() {
		// TODO Auto-generated method stub
		
	}
}
