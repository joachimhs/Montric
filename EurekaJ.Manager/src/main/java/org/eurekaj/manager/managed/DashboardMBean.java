package org.eurekaj.manager.managed;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.Hashtable;
import java.util.List;

import javax.faces.event.ActionEvent;
import javax.faces.event.ValueChangeEvent;
import javax.faces.model.DataModel;
import javax.faces.model.SelectItem;

import org.eurekaj.manager.berkeley.statistics.LiveStatistics;
import org.eurekaj.manager.berkeley.treemenu.TreeMenuNode;
import org.eurekaj.manager.berkley.dashboard.Dashboard;
import org.eurekaj.manager.berkley.dashboard.Gadget;
import org.eurekaj.manager.berkley.dashboard.GadgetGuiWrapper;
import org.eurekaj.manager.perst.alert.Alert;
import org.eurekaj.manager.service.DashboardService;
import org.eurekaj.manager.service.TreeMenuService;
import org.eurekaj.manager.util.ChartUtil;
import org.eurekaj.manager.util.TreeMenuUtil;
import org.jsflot.xydata.XYDataSetCollection;

import javax.faces.model.ListDataModel;

public class DashboardMBean implements AlertableMBean {
	private DashboardService dashboardService;
	private TreeMenuService treeMenuService;
	private DataModel dashboardDataModel = new ListDataModel();
	private DataModel gadgetDataModel = new ListDataModel();
	private String newDashboardName;
	private String newGadgetName;
	private Dashboard editDashboard;
	private Date showChartFrom;
	private Date showChartTo;
	private Hashtable<String, String> gadgetsUnderEdit = new Hashtable<String, String>();
	
	public DashboardMBean() {
		// TODO Auto-generated constructor stub
	}
	
	private void updateChartTimes() {
		Calendar nowCal = Calendar.getInstance();
		setShowChartTo(nowCal.getTime());
		Calendar thenCal = Calendar.getInstance();
		thenCal.add(Calendar.MINUTE, 10 * -1);
		setShowChartFrom(thenCal.getTime());
	}
	
	public DashboardService getDashboardService() {
		return dashboardService;
	}
	
	public void setDashboardService(DashboardService dashboardService) {
		this.dashboardService = dashboardService;
	}
	
	public TreeMenuService getTreeMenuService() {
		return treeMenuService;
	}
	
	public void setTreeMenuService(TreeMenuService treeMenuService) {
		this.treeMenuService = treeMenuService;
	}
	
	public String getNewDashboardName() {
		return newDashboardName;
	}
	
	public void setNewDashboardName(String newDashboardName) {
		this.newDashboardName = newDashboardName;
	}
	
	public String getNewGadgetName() {
		return newGadgetName;
	}
	
	public void setNewGadgetName(String newGadgetName) {
		this.newGadgetName = newGadgetName;
	}
	
	public Dashboard getEditDashboard() {
		return editDashboard;
	}
	
	public Date getShowChartFrom() {
		return showChartFrom;
	}
	
	public void setShowChartFrom(Date showChartFrom) {
		this.showChartFrom = showChartFrom;
	}
	
	public Date getShowChartTo() {
		return showChartTo;
	}
	
	public void setShowChartTo(Date showChartTo) {
		this.showChartTo = showChartTo;
	}
	
	public Long getMinXAxis() {
		return ChartUtil.getMinXAxis(showChartFrom);
	}
	
	public Long getMaxXAxis() {
		return ChartUtil.getMaxXAxis(showChartTo);
	}
	
	public boolean isAtleastOneGadgetInEditMode() {
		boolean edit = false;
		List<GadgetGuiWrapper> gadgetList = (List<GadgetGuiWrapper>)gadgetDataModel.getWrappedData();
		for (GadgetGuiWrapper gadget : gadgetList) {
			if (gadget.isEditMode()) {
				edit = true;
				break;
			}
		}
		
		return edit;
	}
	
	public DataModel getDashboards() {
		List<Dashboard> dashboardList = dashboardService.getDashboards();
		dashboardDataModel.setWrappedData(dashboardList);
		return dashboardDataModel;
	}
	
	public DataModel getGadgets() {		
		updateChartTimes();
		gadgetDataModel.setWrappedData(buildGadgetGuiWrapperList());
		return gadgetDataModel;
	}
	
	public void createNewDashboard(ActionEvent event) {
		Dashboard dash = new Dashboard();
		dash.setDashboardName(newDashboardName);
		dashboardService.persistDashboard(dash);
	}
	
	public void editDashboardAction(ActionEvent event) {		
		editDashboard = (Dashboard)dashboardDataModel.getRowData();
		if (editDashboard == null) {
			editDashboard = new Dashboard();
			editDashboard.setDashboardName("Unknown Dashboard");
		}
		
		
		gadgetDataModel.setWrappedData(buildGadgetGuiWrapperList());
		
	}
	
	private List<GadgetGuiWrapper> buildGadgetGuiWrapperList() {
		List<GadgetGuiWrapper> guiGadgetList = new ArrayList<GadgetGuiWrapper>();
		
		if (showChartFrom == null || showChartTo == null) {
			updateChartTimes();
		}
		Long fromPeriod = showChartFrom.getTime() / 15000;
		Long toPeriod = showChartTo.getTime() / 15000;
		for (Gadget gadget : editDashboard.getGadgetList()) {
			GadgetGuiWrapper ggw = new GadgetGuiWrapper(gadget);
			if (ggw.isChartGadget()) {
				List<LiveStatistics> liveList = treeMenuService.getLiveStatistics(ggw.getGadget().getGuiPath(), fromPeriod, toPeriod);
				Collections.sort(liveList);
				
				Alert alert = treeMenuService.getAlert(ggw.getGadget().getGuiPath());
				
				XYDataSetCollection xyDataSet = ChartUtil.generateDataset(liveList, ggw.getGadget().getGuiPath(), alert, showChartFrom, showChartTo, 15);
				ggw.setChartCollection(xyDataSet);
			}
			
			if (gadgetsUnderEdit.get(ggw.getGadget().getHeadline()) != null) {
				ggw.setEditMode(true);
			} else {
				ggw.setEditMode(false);
			}
			
			guiGadgetList.add(ggw);
		}
		
		
		return guiGadgetList;
	}
	
	public void deleteDashboardAction(ActionEvent event) {
		Dashboard dash = (Dashboard)dashboardDataModel.getRowData();
		dashboardService.deleteDashboard(dash.getDashboardName());
		if (editDashboard.getDashboardName().equals(dash.getDashboardName())) {
			editDashboard = null;
		}
		getDashboards();
	}
	
	public void addGadgetAction(ActionEvent event) {
		Gadget gadget = new Gadget(newGadgetName, Gadget.GadgetType.ChartGadget);
		gadget.setDescription("Default Description");
		editDashboard.getGadgetList().add(gadget);
		
		dashboardService.persistDashboard(editDashboard);
		gadgetDataModel.setWrappedData(buildGadgetGuiWrapperList());
	}
	
	public void editGadgetAction(ActionEvent event) {
		GadgetGuiWrapper gadget = (GadgetGuiWrapper)gadgetDataModel.getRowData();
		gadgetsUnderEdit.put(gadget.getGadget().getHeadline(), gadget.getGadget().getHeadline());
		gadgetDataModel.setWrappedData(buildGadgetGuiWrapperList());
	}
	
	public void saveGadgetChangesAction(ActionEvent event) {
		dashboardService.persistDashboard(editDashboard);
		GadgetGuiWrapper gadget = (GadgetGuiWrapper)gadgetDataModel.getRowData();
		gadgetsUnderEdit.remove(gadget.getGadget().getHeadline());
		
		gadgetDataModel.setWrappedData(buildGadgetGuiWrapperList());
	}
	
	public List<SelectItem> getEditGadgetTypeItems() {
		List<SelectItem> gadgetTypeList = new ArrayList<SelectItem>();
		for (Gadget.GadgetType type : Gadget.GadgetType.values()) {
			gadgetTypeList.add(new SelectItem(type.toString(), type.toString()));
		}
		
		return gadgetTypeList;
	}
	
	public List<SelectItem> getEditGadgetGuiPathItems() {
		List<SelectItem> guiPathList = new ArrayList<SelectItem>();
		
		List<TreeMenuNode> treeMenuNodeList = TreeMenuUtil.getLeafNodes(treeMenuService.getTreeMenu());
		for (TreeMenuNode node : treeMenuNodeList) {
			guiPathList.add(new SelectItem(node.getGuiPath(), node.getGuiPath()));
		}
		
		
		return guiPathList;
	}
	
	
	@Override
	public void processPathChange() {
		//Nothing to do		
	}

}
