package org.eurekaj.manager.managed;

import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import javax.faces.event.ActionEvent;
import javax.faces.event.ValueChangeEvent;

import org.apache.log4j.Logger;
import org.eurekaj.manager.berkeley.statistics.LiveStatistics;
import org.eurekaj.manager.perst.alert.Alert;
import org.eurekaj.manager.perst.statistics.GroupedStatistics;
import org.eurekaj.manager.service.TreeMenuService;
import org.eurekaj.manager.util.ChartUtil;
import org.jsflot.components.FlotChartClickedEvent;
import org.jsflot.components.FlotChartDraggedEvent;
import org.jsflot.xydata.XYDataList;
import org.jsflot.xydata.XYDataSetCollection;

public class ChartMBean implements AlertableMBean {
	private UserMBean userMBean;
	private TreeMenuService treeMenuService; 
	private static Logger log = Logger.getLogger(ChartMBean.class);

	private XYDataSetCollection valueCollection;
	private List<LiveStatistics> liveList;
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
	/*// End Chart data */
	
	public ChartMBean() {
		super();
		// Vis default graf for siste 20 minutter
		Calendar fromCal =Calendar.getInstance();
		fromCal.add(Calendar.MINUTE, MINUTES * -1);
		Calendar toCal = Calendar.getInstance();
		setShowChartTo(toCal.getTime());
		setShowChartFrom(fromCal.getTime());
		showLiveData = true;
		valueCollection = new XYDataSetCollection();
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
	
	public Long getMinXAxis() {
		return ChartUtil.getMinXAxis(showChartFrom);
	}
	
	public Long getMaxXAxis() {
		return ChartUtil.getMaxXAxis(showChartTo);
	}
	
	private void clearLiveList() {
		if (liveList != null) {
			liveList.clear();
			liveList = null;
		}
	}
	public void updateDataset() {
		
		if (isShowLiveData()) {
			//View for the last MINUTES minutes
			Calendar nowCal = Calendar.getInstance();
			setShowChartTo(nowCal.getTime());
			Calendar thenCal = Calendar.getInstance();
			thenCal.add(Calendar.MINUTE, MINUTES * -1);
			setShowChartFrom(thenCal.getTime());
		} 
		
		
		String path = userMBean.getSelectedPath();
		valueChartTitle = path;
		if (path != null) {
			Long fromPeriod = showChartFrom.getTime() / 15000;
			Long toPeriod = showChartTo.getTime() / 15000;
			
			valueCollection.clearDataCollection();
			
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
					for (XYDataList dataList : ChartUtil.generateDataset(liveList, seriesLabel, null, showChartFrom, showChartTo, RESOLUTION).getDataList()) {
						valueCollection.addDataList(dataList);
					}
				}
			} else {
				clearLiveList();
				liveList = treeMenuService.getLiveStatistics(path, fromPeriod, toPeriod);
				Collections.sort(liveList);
				
				Alert alert = treeMenuService.getAlert(path);
				
				String seriesLabel = path;
				if (seriesLabel.contains(":")) {
					seriesLabel = seriesLabel.substring(path.lastIndexOf(":") + 1, path.length());
				}
				valueCollection = ChartUtil.generateDataset(liveList, seriesLabel, alert, showChartFrom, showChartTo, RESOLUTION);
			}
		}
	}

	public XYDataSetCollection getValueLineData() {
		updateDataset();
		return valueCollection;
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
	
	public void selectLiveDataTab(ActionEvent event) {
		this.setShowLiveData(true);
	}
	
	public void selectCustomDataTab(ActionEvent event) {
		this.setShowLiveData(false);
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
	
	@Override
	public void processPathChange() {
		updateDataset();
		this.setShowLiveData(true);
	}

}
