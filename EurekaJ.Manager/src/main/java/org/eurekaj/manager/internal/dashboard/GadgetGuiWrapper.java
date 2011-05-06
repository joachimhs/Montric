package org.eurekaj.manager.internal.dashboard;

import org.jsflot.xydata.XYDataSetCollection;

public class GadgetGuiWrapper {
	private Gadget gadget;
	private boolean editMode = false;
	private XYDataSetCollection chartCollection;
	
	public GadgetGuiWrapper(Gadget gadget) {
		super();
		this.gadget = gadget;
	}

	public Gadget getGadget() {
		return gadget;
	}

	public void setGadget(Gadget gadget) {
		this.gadget = gadget;
	}

	public boolean isEditMode() {
		return editMode;
	}

	public void setEditMode(boolean editMode) {
		this.editMode = editMode;
	}
	
	public XYDataSetCollection getChartCollection() {
		return chartCollection;
	}
	
	public void setChartCollection(XYDataSetCollection chartCollection) {
		this.chartCollection = chartCollection;
	}
	
	public boolean isChartGadget() {
		return gadget.getGadgetType() == Gadget.GadgetType.ChartGadget && gadget.getGuiPath() != null;
	}
	
	
}
