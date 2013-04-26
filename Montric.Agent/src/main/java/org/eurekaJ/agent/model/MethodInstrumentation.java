package org.eurekaJ.agent.model;

public class MethodInstrumentation {
	private String methodName;
	private String classType;
	
	public MethodInstrumentation(String methodName, String classType) {
		super();
		this.methodName = methodName;
		this.classType = classType;
	}

	public String getMethodName() {
		return methodName;
	}

	public void setMethodName(String methodName) {
		this.methodName = methodName;
	}

	public String getClassType() {
		return classType;
	}

	public void setClassType(String classType) {
		this.classType = classType;
	}
	
	public String toString() {
		return methodName + " " + classType;
	}
	
}
