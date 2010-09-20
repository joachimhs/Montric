package org.eurekaj.manager.berkley.dashboard;

import com.sleepycat.persist.model.Persistent;

@Persistent
public class Gadget {
	private String headline;
	private String subHeadline;
	private String description;
	private String guiPath;
	public enum GadgetType {ChartGadget, AlertSummaryStatus, RecentAlertsSummary}
	private GadgetType gadgetType;

	public Gadget() {
		// TODO Auto-generated constructor stub
	}
	
	public Gadget(String headline, GadgetType gadgetType) {
		super();
		this.headline = headline;
		this.gadgetType = gadgetType;
	}

	public String getHeadline() {
		return headline;
	}

	public void setHeadline(String headline) {
		this.headline = headline;
	}

	public String getSubHeadline() {
		return subHeadline;
	}

	public void setSubHeadline(String subHeadline) {
		this.subHeadline = subHeadline;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getGuiPath() {
		return guiPath;
	}

	public void setGuiPath(String guiPath) {
		this.guiPath = guiPath;
	}
	
	public GadgetType getGadgetType() {
		return gadgetType;
	}
	
	public void setGadgetType(GadgetType gadgetType) {
		this.gadgetType = gadgetType;
	}
	
	public boolean isChartGadget() {
		return this.getGadgetType() == Gadget.GadgetType.ChartGadget;
	}

}
