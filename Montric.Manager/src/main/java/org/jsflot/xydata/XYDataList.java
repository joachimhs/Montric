/*
Copyright (c) 2009 Joachim Haagen Skeie

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

package org.jsflot.xydata;

import java.util.ArrayList;
import java.util.List;

public class XYDataList {
	private List<XYDataPoint> dataPointList;
	private boolean showDataPoints = false;
	private boolean fillLines = false;
	private boolean showLines = false;
	private String label = "";
	private boolean markers = false;
	private String markerPosition = "ct";
	private String color = null;
	
	public XYDataList() {
		dataPointList = new ArrayList<XYDataPoint>();
	}
	
	public boolean isShowDataPoints() {
		return showDataPoints;
	}

	public void setShowDataPoints(boolean showDataPoints) {
		this.showDataPoints = showDataPoints;
	}
	
	public void setShowDataPoints(Object objShowDataPoints) {
		if (objShowDataPoints instanceof String) {
			this.showDataPoints = new Boolean((String)objShowDataPoints);
		} else if (objShowDataPoints instanceof Boolean) {
			this.showDataPoints = (Boolean)objShowDataPoints;
		}
	}

	public boolean isFillLines() {
		return fillLines;
	}

	public void setFillLines(boolean fillLines) {
		this.fillLines = fillLines;
	}
	
	public void setFillLines(Object objFillLines) {
		if (objFillLines instanceof String) {
			this.fillLines = new Boolean((String)objFillLines);
		} else if (objFillLines instanceof Boolean) {
			this.fillLines = (Boolean)objFillLines;
		}
	}

	public boolean isShowLines() {
		return showLines;
	}

	public void setShowLines(boolean showLines) {
		this.showLines = showLines;
	}
	
	public void setShowLines(Object objShowLines) {
		if (objShowLines instanceof String) {
			this.showLines = new Boolean((String)objShowLines);
		} else if (objShowLines instanceof Boolean) {
			this.showLines = (Boolean)objShowLines;
		}
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public boolean addDataPoint(XYDataPoint point) {
		return dataPointList.add(point);
	}
	
	public boolean addDataPoint(Number x, Number y) {
		return dataPointList.add(new XYDataPoint(x, y));
	}
	
	public void clear() {
		dataPointList.clear();
	}
	
	public boolean isMarkers() {
		return markers;
	}
	
	public void setMarkers(boolean markers) {
		this.markers = markers;
	}
	
	public void setMarkers(Object objMarkers) {
		if (objMarkers instanceof String) {
			this.markers = new Boolean((String)objMarkers);
		} else if (objMarkers instanceof Boolean) {
			this.markers = (Boolean)objMarkers;
		}
	}
	
	public String getMarkerPosition() {
		return markerPosition;
	}
	
	public void setMarkerPosition(String markerPosition) {
		this.markerPosition = markerPosition;
	}
	
	public String getColor() {
		return color;
	}
	
	public void setColor(String color) {
		this.color = color;
	}
	
	public double calculateAvgPointDistance() {
		double pointDistance = 1.0d;
		if (dataPointList.size() > 1) {
			double xAxisRange = dataPointList.get(dataPointList.size() -1).getX().doubleValue() - dataPointList.get(0).getX().doubleValue();
			pointDistance = xAxisRange / dataPointList.size();
		}
		
		return pointDistance;
	}
	
	public boolean removeDataPoint(XYDataPoint point) {
		return dataPointList.remove(point);
	}
	
	public XYDataPoint removeDataPoint(int index) {
		return dataPointList.remove(index);
	}
	
	public List<XYDataPoint> getDataPointList() {
		return dataPointList;
	}
	
	public int size() {
		return dataPointList.size();
	}
	
	public XYDataPoint get(int index) {
		return dataPointList.get(index);
	}

	@Override
	public String toString() {
		return "XYDataList [color=" + color + ", dataPointList="
				+ dataPointList + ", fillLines=" + fillLines + ", label="
				+ label + ", markerPosition=" + markerPosition + ", markers="
				+ markers + ", showDataPoints=" + showDataPoints
				+ ", showLines=" + showLines + "]";
	}
	
	
}
