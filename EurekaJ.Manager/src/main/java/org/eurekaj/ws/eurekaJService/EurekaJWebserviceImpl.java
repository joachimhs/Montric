package org.eurekaj.ws.eurekaJService;

import java.util.ArrayList;
import java.util.List;

import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.datatypes.LiveStatistics;
import org.eurekaj.api.datatypes.TreeMenuNode;
import org.eurekaj.api.enumtypes.AlertStatus;
import org.eurekaj.api.enumtypes.ValueType;
import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.manager.perst.alert.BerkeleyAlert;
import org.eurekaj.manager.service.TreeMenuService;
import org.eurekaj.webservice.*;

public class EurekaJWebserviceImpl implements EurekaJService{
	private TreeMenuService treeMenuService;
	
	public TreeMenuService getTreeMenuService() {
		return treeMenuService;
	}
	
	public void setTreeMenuService(TreeMenuService treeMenuService) {
		this.treeMenuService = treeMenuService;
	}
	
	@Override
	public List<LiveStatisticsResponseElement> getLiveStatistics(String guiPath, Long resolutionMs, long minTimeperiod, long maxTimeperiod) {
		List<LiveStatistics> lsList = treeMenuService.getLiveStatistics(guiPath, minTimeperiod, maxTimeperiod);
		List<LiveStatisticsResponseElement> retList = new ArrayList<LiveStatisticsResponseElement>();
		for (LiveStatistics ls : lsList) {
			LiveStatisticsResponseElement stat = new LiveStatisticsResponseElement();
			stat.setGuiPath(ls.getGuiPath());
			stat.setTimePeriod(ls.getTimeperiod());
			stat.setValue(ls.getValue());
			retList.add(stat);
		}
		
		return retList;
	}

	@Override
	public boolean storeIncomingStatistics(List<StoreIncomingStatisticsElement> storeIncomingStatisticsList) {
		boolean retValue = true;
		
		for (StoreIncomingStatisticsElement sise: storeIncomingStatisticsList) {
			treeMenuService.storeIncomingStatistics(sise.getGuiPath(), sise.getTimeperiod(), sise.getValue(), ValueType.fromValue(sise.getValueType().value()), UnitType.fromValue(sise.getUnitType().value()));
		}
		
		return retValue;
	}

	@Override
	public List<GetCompleteTreemenuResponseElement> getCompleteTreemenu(
			Boolean includeNonliveNodes) {
		List<TreeMenuNode> nodeList = treeMenuService.getTreeMenu();
		List<GetCompleteTreemenuResponseElement> retList = new ArrayList<GetCompleteTreemenuResponseElement>();
		
		for (TreeMenuNode node : nodeList) {
			boolean nodeLive= node.getNodeLive() != null && node.getNodeLive().equalsIgnoreCase("Y");
			
			GetCompleteTreemenuResponseElement element = new GetCompleteTreemenuResponseElement();
			element.setGuiPath(node.getGuiPath());
			element.setNodeLive(nodeLive);
			
			if(nodeLive || (!nodeLive && includeNonliveNodes != null && !includeNonliveNodes.booleanValue())) {	
				retList.add(element);
			}
		}
		
		return retList;
	}
	
	@Override
	public GetTreemenuForGuiPathResponseElement getTreemenuForGuiPath(
			String guiPath, Boolean includeNonliveNodes) {
		GetTreemenuForGuiPathResponseElement retElement = null;
		TreeMenuNode tmn = treeMenuService.getTreeMenu(guiPath);
		if (tmn != null) {
			boolean nodeLive = tmn.getNodeLive() != null && tmn.getNodeLive().equalsIgnoreCase("Y");
			
			if(includeNonliveNodes != null && !includeNonliveNodes.booleanValue() && !nodeLive) {
				tmn = null;
			}
		}
		
		if (tmn != null) {
			retElement = new GetTreemenuForGuiPathResponseElement();
			retElement.setGuiPath(tmn.getGuiPath());
			retElement.setNodeLive(tmn.getNodeLive() != null && tmn.getNodeLive().equalsIgnoreCase("Y"));
		}
		
		return retElement;
	}

	@Override
	public GetAlertByGuiPathResponseElement getAlertByGuiPath(String guiPath) {
		Alert alert = treeMenuService.getAlert(guiPath);
		GetAlertByGuiPathResponseElement retElement = null;
		
		if (alert != null) {
			retElement = convertFromAlertToWSElement(alert);
		}
		return retElement;
	}
	
	@Override
	public List<GetAlertByGuiPathResponseElement> getAllAlerts() {
		List<Alert> alertList = treeMenuService.getAlerts();
		List<GetAlertByGuiPathResponseElement> retList = new ArrayList<GetAlertByGuiPathResponseElement>();
		
		for (Alert alert : alertList) {
			GetAlertByGuiPathResponseElement retElement = convertFromAlertToWSElement(alert);
			retList.add(retElement);
		}
		
		return retList;
	}
	
	private GetAlertByGuiPathResponseElement convertFromAlertToWSElement(Alert alert) {
		GetAlertByGuiPathResponseElement retElement = new GetAlertByGuiPathResponseElement();
		retElement.setActivated(alert.isActivated());
		retElement.setAlertDelay(alert.getAlertDelay());
		retElement.setErrorThreshold(alert.getErrorValue());
		retElement.setGuiPath(alert.getGuiPath());
		retElement.setSelectedAlertType(AlertType.fromValue(alert.getSelectedAlertType().getTypeName()));
		retElement.setStatus(AlertStatusType.fromValue(alert.getStatus().getStatusName()));
		retElement.setWarningThreshold(alert.getWarningValue());
		
		return retElement;
	}
	
	@Override
	public boolean storeAlert(List<StoreAlertElement> storeAlertList) {
		boolean retVal = true;
		for (StoreAlertElement elem : storeAlertList) {
			BerkeleyAlert alert = new BerkeleyAlert();
			alert.setActivated(elem.isActivated());
			alert.setAlertDelay(elem.getAlertDelay());
			alert.setErrorValue(elem.getErrorThreshold());
			alert.setGuiPath(elem.getGuiPath());
			alert.setSelectedAlertType(org.eurekaj.api.enumtypes.AlertType.valueOf(elem.getSelectedAlertType().value()));
			alert.setStatus(AlertStatus.valueOf(elem.getStatus().value()));
			alert.setWarningValue(elem.getWarningThreshold());
			treeMenuService.persistAlert(alert);
		}
		
		return retVal;
	}


}
