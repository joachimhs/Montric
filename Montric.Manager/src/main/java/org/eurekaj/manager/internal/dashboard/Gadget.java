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

//@Persistent
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
