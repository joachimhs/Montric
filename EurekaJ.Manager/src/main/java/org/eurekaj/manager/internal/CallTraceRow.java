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
