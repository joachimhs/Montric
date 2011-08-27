/**
    EurekaJ Profiler - http://eurekaj.haagen.name
    
    Copyright (C) 2010-2011 Joachim Haagen Skeie

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
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
