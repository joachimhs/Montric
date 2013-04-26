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

public class XYDataSetCollection {
	private List<XYDataList> dataCollection;
	
	public XYDataSetCollection() {
		dataCollection = new ArrayList<XYDataList>();
	}
	
	public boolean addDataList(XYDataList list) {
		return dataCollection.add(list);
	}
	
	public boolean removeDataList(XYDataList list) {
		return dataCollection.remove(list);
	}
	
	public XYDataList removeDataList(int index) {
		return dataCollection.remove(index);
	}
	
	public void clearDataCollection() {
		this.dataCollection.clear();
	}
	
	public List<XYDataList> getDataList() {
		return dataCollection;
	}
	
	public XYDataList get(int index) {
		return dataCollection.get(index);
	}
	
	public int size() {
		return dataCollection.size();
	}
	
	public int indexOf(XYDataList list) {
		return dataCollection.indexOf(list);
	}
}
