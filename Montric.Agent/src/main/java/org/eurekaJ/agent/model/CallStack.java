package org.eurekaJ.agent.model;

import java.util.ArrayList;
import java.util.List;

public class CallStack {
	private String methodName;
	private String methodSignature;
	private String fullyQualifiedClassname;
	private List<CallStack> methodCalls;
	private CallStack callingMethod;
	private int callCount;
	private int level;
	private Long timestamp;
	private Long executionTime;
	private long threadid;
	private String threadName;
	
	public CallStack() {
		methodCalls = new ArrayList<CallStack>();
		threadid = Thread.currentThread().getId();
		threadName = Thread.currentThread().getName();
	}
	
	public String getMethodName() {
		return methodName;
	}
	public void setMethodName(String methodName) {
		this.methodName = methodName;
	}
	
	public String getMethodSignature() {
		return methodSignature;
	}
	public void setMethodSignature(String methodSignature) {
		this.methodSignature = methodSignature;
	}
	
	public String getFullyQualifiedClassname() {
		return fullyQualifiedClassname;
	}
	public void setFullyQualifiedClassname(String fullyQualifiedClassname) {
		this.fullyQualifiedClassname = fullyQualifiedClassname;
	}
	
	public List<CallStack> getMethodCalls() {
		return methodCalls;
	}
	public void setMethodCalls(List<CallStack> methodCalls) {
		this.methodCalls = methodCalls;
	}
	public boolean addMethodCall(CallStack callStack) {
		callStack.setCallingMethod(this);
		return methodCalls.add(callStack);
	}
	
	public CallStack getCallingMethod() {
		return callingMethod;
	}
	public void setCallingMethod(CallStack callingMethod) {
		this.callingMethod = callingMethod;
	}
	
	public int getCallCount() {
		return callCount;
	}
	public void setCallCount(int callCount) {
		this.callCount = callCount;
	}
	
	public Long getTimestamp() {
		return timestamp;
	}
	public void setTimestamp(Long timestamp) {
		this.timestamp = timestamp;
	}
	
	public Long getExecutionTime() {
		return executionTime;
	}
	public void setExecutionTime(Long executionTime) {
		this.executionTime = executionTime;
	}
	
	public int getLevel() {
		return level;
	}
	public void setLevel(int level) {
		this.level = level;
	}
	
	public String getThreadName() {
		return threadName;
	}

	public void setThreadName(String threadName) {
		this.threadName = threadName;
	}
	
	public long getThreadid() {
		return threadid;
	}
	
	public void setThreadid(long threadid) {
		this.threadid = threadid;
	}

	public String toString() {
		return this.getFullyQualifiedClassname() + " " + this.getMethodName() /*+ this.getMethodSignature()*/ + " " + this.getTimestamp() + " " + this.getExecutionTime() + " " + this.getLevel();
	}
	
}
