package org.eurekaJ.agent.model;

public class CallStackTraceBuilderState {

	private CallStack callStack = null;
	private boolean buildingTrace = false;
	private int count = 0;
	private int level = 0;
	private long theadId;
	private long startTimestamp;
	private long stopTimestamp;
	private String classType;
	private String path;
	private String className;
	private String methodName;
	
	public CallStackTraceBuilderState() {
		theadId = Thread.currentThread().getId();
	}
	
	public CallStack getCallStack() {
		return callStack;
	}
	public void setCallStack(CallStack callStack) {
		this.callStack = callStack;
	}
	public boolean isBuildingTrace() {
		return buildingTrace;
	}
	public void setBuildingTrace(boolean buildingTrace) {
		this.buildingTrace = buildingTrace;
	}
	public int getCount() {
		return count;
	}
	public void incCount() {
		count++;
	}
	
	public int getLevel() {
		return level;
	}
	public void incLevel() {
		level++;
	}
	public void decLevel() {
		level--;
	}

	public long getStartTimestamp() {
		return startTimestamp;
	}

	public void setStartTimestamp(long startTimestamp) {
		this.startTimestamp = startTimestamp;
	}

	public long getStopTimestamp() {
		return stopTimestamp;
	}

	public void setStopTimestamp(long stopTimestamp) {
		this.stopTimestamp = stopTimestamp;
	}

	public long getTheadId() {
		return theadId;
	}

	public void setTheadId(long theadId) {
		this.theadId = theadId;
	}
	
	public String getClassType() {
		return classType;
	}
	
	public void setClassType(String classType) {
		this.classType = classType;
	}
	
	public String getPath() {
		return path;
	}
	
	public void setPath(String path) {
		this.path = path;
	}
	
	public String getClassName() {
		return className;
	}
	
	public void setClassName(String className) {
		this.className = className;
	}
	
	public String getMethodName() {
		return methodName;
	}
	
	public void setMethodName(String methodName) {
		this.methodName = methodName;
	}
}
