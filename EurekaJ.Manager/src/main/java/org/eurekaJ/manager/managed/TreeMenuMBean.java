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

public class TreeMenuMBean {
	private static Logger log = Logger.getLogger(TreeMenuMBean.class);
	private GroupInstrumentationMBean groupInstrumentationMbean;
	private AlertMBean alertMBean;
	private TreeMenuService treeMenuService;
	private TreeNode<TreeMenuNodeData> rootNode = null;
	private boolean showChart = false;
	private boolean showValueChart = false;
	private boolean showCallsPerIntervalChart = false;
	private String currTitle = "";
	private String currKey = "";
	private XYDataSetCollection avgExecCollection;
	private XYDataSetCollection valueCollection;
	private XYDataSetCollection callsPerIntervalCollection;
	private XYDataSetCollection totalExecCollection;
	private List<LiveStatistics> liveList;
	private Long customerID = null;
	private String path = null;
	private Date menuLastLoaded = null;
	private String valueChartTitle = "";
	private String callsPerIntervalChartTitle = "";
	private String avgExecTimeChartTitle = "";
	private int MINUTES = 10;
	private String chartTimespan = "10";
	private int RESOLUTION = 15;
	private String chartResolution = "15";
	private Date showChartFrom;
	private Date showChartTo;
	private boolean showLiveData;
	private String selectedInstrumentationGroup;
	private String selectedAlertGroup;
	private String contextKey;

	public TreeMenuMBean() {
		// Vis default graf for siste 20 minutter
		Calendar fromCal =Calendar.getInstance();
		fromCal.add(Calendar.MINUTE, MINUTES * -1);
		Calendar toCal = Calendar.getInstance();
		setShowChartTo(toCal.getTime());
		setShowChartFrom(fromCal.getTime());
		showLiveData = true;
		avgExecCollection = new XYDataSetCollection();
		totalExecCollection = new XYDataSetCollection();
		valueCollection = new XYDataSetCollection();
		callsPerIntervalCollection = new XYDataSetCollection();
	}

	public GroupInstrumentationMBean getGroupInstrumentationMbean() {
		return groupInstrumentationMbean;
	}
	
	public void setGroupInstrumentationMbean(GroupInstrumentationMBean groupInstrumentationMbean) {
		this.groupInstrumentationMbean = groupInstrumentationMbean;
	}
	
	public AlertMBean getAlertMBean() {
		return alertMBean;
	}
	
	public void setAlertMBean(AlertMBean alertMBean) {
		this.alertMBean = alertMBean;
	}
	
	public TreeMenuService getTreeMenuService() {
		return treeMenuService;
	}

	public void setTreeMenuService(TreeMenuService treeMenuService) {
		this.treeMenuService = treeMenuService;
	}
	
	public String getCurrKey() {
		return currKey;
	}
	
	public String getSelectedPath() {
		return path;
	}
	
	public String getSelectedAlertGroup() {
		return selectedAlertGroup;
	}
	
	public void setSelectedAlertGroup(String selectedAlertGroup) {
		this.selectedAlertGroup = selectedAlertGroup;
	}
	
	public String getSelectedInstrumentationGroup() {
		return selectedInstrumentationGroup;
	}
	
	public void setSelectedInstrumentationGroup(String selectedInstrumentationGroup) {
		this.selectedInstrumentationGroup = selectedInstrumentationGroup;
	}
	
	public String getContextKey() {
		return contextKey;
	}
	
	public void setContextKey(String contextKey) {
		this.contextKey = contextKey;
	}
	
	public Long getMinXAxis() {
		Long retVal = showChartFrom.getTime();
		if (retVal != null) {
			int offsetMiutes = showChartFrom.getTimezoneOffset(); //number of minutes offset from GMT// Timstamps for the last 8 minutes
			retVal -= (offsetMiutes * 60 * 1000);
		}
		
		return retVal;
	}
	
	public Long getMaxXAxis() {
		Long retVal = showChartTo.getTime();
		if (retVal != null) {
			int offsetMiutes = showChartTo.getTimezoneOffset(); //number of minutes offset from GMT// Timstamps for the last 8 minutes
			retVal -= (offsetMiutes * 60 * 1000) + 15000;
		}
		
		return retVal;
	}

	public void loadTree() {
		//Update TreeMenuNode in Database
		rootNode = new TreeNodeImpl<TreeMenuNodeData>();
		
		String custName = "Customername";
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
		showChart = false;
		showValueChart = false;
		showCallsPerIntervalChart = false;
		HtmlTree tree = (HtmlTree) event.getComponent();
		currTitle = ((TreeMenuNodeData) tree.getRowData()).getLabel();
		currKey = tree.getRowKey().toString();
		System.out.println("key: " + currKey + " value: " + currTitle);

		customerID = null;
		path = null;

		String[] pathVars = currKey.split(":");
		customerID = 1l; // pathVars[0];

		//Remove Customer Name from Path
		path = currKey.substring(pathVars[0].length() + 1);
		System.out.println("custID: " + customerID + " path: " + path);
		updateDataset();
		groupInstrumentationMbean.setSelectedPath(path);
		groupInstrumentationMbean.updateGroupSelection();
		alertMBean.setSelectedPath(path);
	}
	
	public void processContextMenu(ActionEvent event) {
		HtmlMenuItem menuItem = (HtmlMenuItem)event.getSource();
        //contextKey = menuItem.getData().toString();
	}

	private void generateDataset(List<LiveStatistics> liveList, String seriesLabel) {
		XYDataList execList = new XYDataList();
		execList.setLabel(seriesLabel);
		XYDataList totalList = new XYDataList();
		totalList.setLabel(seriesLabel);
		XYDataList callsList = new XYDataList();
		callsList.setLabel(seriesLabel);
		XYDataList valueList = new XYDataList();
		valueList.setLabel(seriesLabel);
		
		Hashtable<Long, LiveStatistics> liveHash = new Hashtable<Long, LiveStatistics>();
		for (LiveStatistics l : liveList) {
			liveHash.put(l.getPk().getTimeperiod() * 15000, l);
			// System.out.println("putting livestat in hash: " +
			// l.getTimestamp().getTime() + " : " + l.toString());
		}

		if (isShowLiveData()) {
			//View for the last MINUTES minutes
			Calendar nowCal = Calendar.getInstance();
			setShowChartTo(nowCal.getTime());
			Calendar thenCal = Calendar.getInstance();
			thenCal.add(Calendar.MINUTE, MINUTES * -1);
			setShowChartFrom(thenCal.getTime());
		} 
		
		int offsetMiutes = showChartTo.getTimezoneOffset(); //number of minutes offset from GMT// Timstamps for the last 8 minutes
		
		//Get milliseconds from 1/1/1970 GMT+0
		Long millisNow = showChartTo.getTime();
		Long millisThen = showChartFrom.getTime();
		log.debug("generating chart from: " + showChartFrom + " (" + showChartFrom.getTime() + ")  to: " + showChartTo + " (" + showChartTo.getTime() + ")");

		//Round down to nearest 15 seconds timeperiod
		millisNow = millisNow - 15000 - (millisNow % 15000);
		millisThen = millisThen - (millisThen % 15000) + 15000;

		LiveStatistics currStat = null;
		long numStatsPerChartTick = (RESOLUTION * 1000) / 15000;
		long numStatsInCurrTick = -1;
		//Loop over all stats for each 15 second period
		for (Long i = millisThen; i <= millisNow; i += 15000) {
			++numStatsInCurrTick;
			LiveStatistics l = liveHash.get(i);
			if (l != null) {
				if (currStat == null) {
					//First iteration, or new chart tick
					currStat = new LiveStatistics();
					currStat.setCallsPerInterval(l.getCallsPerInterval());
					currStat.setValue(l.getValue());
					currStat.setTotalExecutionTime(l.getTotalExecutionTime());
				} else  {
					currStat.addCallsPerInterval(l.getCallsPerInterval());
					currStat.addTotalExecutionTime(l.getTotalExecutionTime());
					
					if (l.getValue() != null) {
						Long totalValue = currStat.getValue() * (numStatsInCurrTick - 1);
						totalValue += l.getValue();
						currStat.setValue(totalValue / numStatsInCurrTick);
					}
					
					if (numStatsInCurrTick >= numStatsPerChartTick) {
						//place currStat in chart, set currStat to null
						long gmtMillis = i - (offsetMiutes * 60 * 1000);
						if (currStat.getAvgExecutionTime() != null) {
							execList.addDataPoint(new XYDataPoint(gmtMillis, currStat.getAvgExecutionTime()));
						} else {
							execList.addDataPoint(new XYDataPoint(gmtMillis, new Double(0)));
						}
						if (currStat.getTotalExecutionTime() != null) {
							totalList.addDataPoint(new XYDataPoint(gmtMillis, currStat.getTotalExecutionTimeMillis()));
						} else {
							totalList.addDataPoint(new XYDataPoint(gmtMillis, new Double(0)));
						}
						if (currStat.getCallsPerInterval() != null) {
							callsList.addDataPoint(new XYDataPoint(gmtMillis, currStat.getCallsPerInterval()));
						} else {
							callsList.addDataPoint(new XYDataPoint(gmtMillis, new Double(0)));
						}
						if (currStat.getValue() != null) {
							valueList.addDataPoint(new XYDataPoint(gmtMillis, currStat.getValue()));
						} else {
							valueList.addDataPoint(new XYDataPoint(gmtMillis, new Double(0)));
						}
						
						currStat = null;
						numStatsInCurrTick = -1;
					}
				}
			}
			
		}

		if (liveList != null && liveList.size() > 0) {
			LiveStatistics ls = liveList.get(0);
			
			determineWhichChartsToDisplay(path);
			//If this node has grouped statistics, show them
			GroupedStatistics gs = treeMenuService.getGroupedStatistics(path);
			if (gs != null) {
				for (String groupedPath : gs.getGroupedPathList()) {
					determineWhichChartsToDisplay(groupedPath);
				}
			}

			if (showChart) {
				avgExecTimeChartTitle = currKey;
				avgExecCollection.addDataList(execList);
				totalExecCollection.addDataList(totalList);
			}
			if (showValueChart) {
				valueChartTitle = currKey;
				valueCollection.addDataList(valueList);
			}
			if (showCallsPerIntervalChart) {
				callsPerIntervalChartTitle = currKey;
				callsPerIntervalCollection.addDataList(callsList);
			}
		}
	}
	
	private void determineWhichChartsToDisplay(String guiPath) {
		TreeMenuNode currNode = treeMenuService.getTreeMenu(guiPath);
		if (currNode != null) {
			showChart = currNode.isHasExecTimeInformation();
			showCallsPerIntervalChart = currNode.isHasCallsPerIntervalInformation();
			showValueChart = currNode.isHasValueInformation();
		}
	}
	
	private void clearLiveList() {
		if (liveList != null) {
			liveList.clear();
			liveList = null;
		}
	}
	public void updateDataset() {
		if (customerID != null && path != null) {
			Long fromPeriod = showChartFrom.getTime() / 15000;
			Long toPeriod = showChartTo.getTime() / 15000;
			
			avgExecCollection.clearDataCollection();
			totalExecCollection.clearDataCollection();
			valueCollection.clearDataCollection();
			callsPerIntervalCollection.clearDataCollection();
			
			GroupedStatistics gs = treeMenuService.getGroupedStatistics(path);
			if (gs != null) {
				//There are grouped statistics, all must be added to the chart
				for (String gsPath : gs.getGroupedPathList()) {
					clearLiveList();
					liveList = treeMenuService.getLiveStatistics(gsPath, fromPeriod, toPeriod);
					Collections.sort(liveList);
					String seriesLabel = gsPath;
					if (gsPath.length() > path.length() + 1) {
						seriesLabel = gsPath.substring(path.length() + 1, gsPath.length());
					}
					generateDataset(liveList, seriesLabel);
				}
			} else {
				clearLiveList();
				liveList = treeMenuService.getLiveStatistics(path, fromPeriod, toPeriod);
				Collections.sort(liveList);
				
				String seriesLabel = path;
				if (seriesLabel.contains(":")) {
					seriesLabel = seriesLabel.substring(path.lastIndexOf(":") + 1, path.length());
				}
				generateDataset(liveList, seriesLabel);
			}
		}
	}

	public boolean isShowChart() {
		return showChart;
	}

	public void setShowChart(boolean showChart) {
		this.showChart = showChart;
	}

	public boolean isShowValueChart() {
		return showValueChart;
	}

	public void setShowValueChart(boolean showValueChart) {
		this.showValueChart = showValueChart;
	}

	public boolean isShowCallsPerIntervalChart() {
		return showCallsPerIntervalChart;
	}

	public void setShowCallsPerIntervalChart(boolean showCallsPerIntervalChart) {
		this.showCallsPerIntervalChart = showCallsPerIntervalChart;
	}

	public XYDataSetCollection getAvgExecXYData() {
		updateDataset();
		return avgExecCollection;
	}
	
	public XYDataSetCollection getTotalExecXYData() {
		updateDataset();
		return totalExecCollection;
	}
	
	
	public XYDataSetCollection getValueLineData() {
		updateDataset();
		return valueCollection;
	}
	
	public XYDataSetCollection getCallsPerIntervalData() {
		updateDataset();
		return callsPerIntervalCollection;
	}

	public String getCurrTitle() {
		return currTitle;
	}

	public void setCurrTitle(String currTitle) {
		this.currTitle = currTitle;
	}

	public String getValueChartTitle() {
		return valueChartTitle;
	}

	public void setValueChartTitle(String valueChartTitle) {
		this.valueChartTitle = valueChartTitle;
	}

	public String getAvgExecTimeChartTitle() {
		return avgExecTimeChartTitle;
	}

	public void setAvgExecTimeChartTitle(String avgExecTimeChartTitle) {
		this.avgExecTimeChartTitle = avgExecTimeChartTitle;
	}

	public String getCallsPerIntervalChartTitle() {
		return callsPerIntervalChartTitle;
	}

	public void setCallsPerIntervalChartTitle(String callsPerIntervalChartTitle) {
		this.callsPerIntervalChartTitle = callsPerIntervalChartTitle;
	}

	public List<LiveStatistics> getLiveList() {
		return liveList;
	}

	public void setLiveList(List<LiveStatistics> liveList) {
		this.liveList = liveList;
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
	
	public boolean isShowLiveData() {
		return showLiveData;
	}
	
	public void setShowLiveData(boolean showLiveData) {
		this.showLiveData = showLiveData;
		updateDataset();
	}
	
	public String getChartTimespan() {
		return chartTimespan;
	}
	
	public void setChartTimespan(String chartTimespan) {
		boolean timespanChanged = !this.chartTimespan.equals(chartTimespan);
		this.chartTimespan = chartTimespan;
		try {
			MINUTES = Integer.parseInt(this.chartTimespan);
			if (timespanChanged) {
				//Timespan have changed. Change chart Resolution accordingly
				if (MINUTES == 10)   { setChartResolution("15"); }
				if (MINUTES == 20)   { setChartResolution("30"); }
				if (MINUTES == 30)   { setChartResolution("45"); }
				if (MINUTES == 60)   { setChartResolution("60"); }
				if (MINUTES == 120)  { setChartResolution("180"); }
				if (MINUTES == 360)  { setChartResolution("600"); }
				if (MINUTES == 720)  { setChartResolution("1200"); }
				if (MINUTES == 1440) { setChartResolution("2400"); }
				
				//Updating dates according to new timespan
				Calendar fromCal = Calendar.getInstance();
				fromCal.setTime(showChartTo);
				fromCal.add(Calendar.MINUTE, MINUTES * -1);
				setShowChartFrom(fromCal.getTime());
			}
		} catch (NumberFormatException nfe) {
			//Reset to 10 minutes
			MINUTES = 10;
			RESOLUTION = 15;
			this.chartTimespan = "10";
			this.chartResolution = "15";
		}
	}
	
	public String getChartResolution() {
		return chartResolution;
	}
	
	public void setChartResolution(String chartResolution) {
		this.chartResolution = chartResolution;
		try {
			RESOLUTION = Integer.parseInt(this.chartResolution);
		} catch (NumberFormatException nfe) {
			//Reset to 10 minutes
			MINUTES = 10;
			RESOLUTION = 15;
			this.chartTimespan = "10";
			this.chartResolution = "15";
		}
	}
	
	public void updateChart(ActionEvent event) {
		updateDataset();
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

	@Deprecated //Pre JSFLot 0.3.0
	public void chartDraggedListener(ValueChangeEvent event) {
		log.info("chartDraggedListener called");
		double chartMoved = 0; //milliseconds
		String newValue = (String)event.getNewValue();
		String oldValue = (String)event.getOldValue();
		
		try {
			chartMoved = Double.parseDouble(newValue);
		} catch (NumberFormatException nfe) {
			nfe.printStackTrace();
			chartMoved = 0;
		}
		
		Calendar fromCal = Calendar.getInstance();
		fromCal.setTime(showChartFrom);
		Calendar toCal = Calendar.getInstance();
		toCal.setTime(showChartTo);
		
		fromCal.add(Calendar.MILLISECOND, (int)chartMoved);
		toCal.add(Calendar.MILLISECOND, (int)chartMoved);
		setShowChartFrom(fromCal.getTime());
		setShowChartTo(toCal.getTime());
		
		updateDataset();
	}
	
	public void chartListener(ActionEvent event) {
		if (event instanceof FlotChartClickedEvent) {
			//Not Yet Implemented
		} else if (event instanceof FlotChartDraggedEvent) {
			FlotChartDraggedEvent dragEvent = (FlotChartDraggedEvent)event;
			Double chartMoved = dragEvent.getDragValue();
			
			Calendar fromCal = Calendar.getInstance();
			fromCal.setTime(showChartFrom);
			Calendar toCal = Calendar.getInstance();
			toCal.setTime(showChartTo);
			
			fromCal.add(Calendar.MILLISECOND, chartMoved.intValue());
			toCal.add(Calendar.MILLISECOND, chartMoved.intValue());
			setShowChartFrom(fromCal.getTime());
			setShowChartTo(toCal.getTime());
			
			updateDataset();
		}
	}
}
