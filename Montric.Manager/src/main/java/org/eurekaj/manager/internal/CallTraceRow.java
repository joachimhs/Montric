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
package org.eurekaj.manager.internal;

public class CallTraceRow {
	private Long headid;
	private String packageAndClassname;
	private String methodName;
	private Long timestamp;
	private String execTime;
	private int callTraceLevel;
	
	public CallTraceRow() {
		// TODO Auto-generated constructor stub
	}
	
	public CallTraceRow(Long headid, String packageAndClassname, String methodName, Long timestamp, String execTime, int callTraceLevel) {
		super();
		this.headid = headid;
		this.packageAndClassname = packageAndClassname;
		this.methodName = methodName;
		this.timestamp = timestamp;
		this.execTime = execTime;
		this.callTraceLevel = callTraceLevel;
	}

	public Long getHeadid() {
		return headid;
	}

	public void setHeadid(Long headid) {
		this.headid = headid;
	}

	public String getPackageAndClassname() {
		return packageAndClassname;
	}

	public void setPackageAndClassname(String packageAndClassname) {
		this.packageAndClassname = packageAndClassname;
	}

	public String getMethodName() {
		return methodName;
	}

	public void setMethodName(String methodName) {
		this.methodName = methodName;
	}

	public Long getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Long timestamp) {
		this.timestamp = timestamp;
	}

	public String getExecTime() {
		return execTime;
	}

	public void setExecTime(String execTime) {
		this.execTime = execTime;
	}

	public int getCallTraceLevel() {
		return callTraceLevel;
	}

	public void setCallTraceLevel(int callTraceLevel) {
		this.callTraceLevel = callTraceLevel;
	}
	
	
	
}
