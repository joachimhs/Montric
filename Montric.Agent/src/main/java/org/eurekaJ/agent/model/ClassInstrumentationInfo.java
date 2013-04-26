package org.eurekaJ.agent.model;

import java.util.Hashtable;

public class ClassInstrumentationInfo {
	private String packageName;
	private String className;
	private Hashtable<String, MethodInstrumentation> methodNameHash;
	private String path;
	private boolean doesExtend;
	private boolean doesImplement;
	
	public ClassInstrumentationInfo(String packageName, String className, String methodName, String classType, String path, String doesExtend, String doesImplement) {
		super();
		methodNameHash = new Hashtable<String, MethodInstrumentation>();
		this.packageName = packageName;
		this.className = className;
		MethodInstrumentation mi = new MethodInstrumentation(methodName, classType);
		
		methodNameHash.put(methodName, mi);
		this.path = path;
		setDoesExtend(doesExtend);
		setDoesImplement(doesImplement);
	}
	
	public String getPackageName() {
		return packageName;
	}
	public void setPackageName(String packageName) {
		this.packageName = packageName;
	}
	public String getClassName() {
		return className;
	}
	public void setClassName(String className) {
		this.className = className;
	}
	public Hashtable<String, MethodInstrumentation> getMethodNameHash() {
		return methodNameHash;
	}
	
	public String getPath() {
		return path;
	}
	public void setPath(String path) {
		this.path = path;
	}
	
	public boolean isDoesExtend() {
		return doesExtend;
	}
	
	public void setDoesExtend(boolean doesExtend) {
		this.doesExtend = doesExtend;
	}
	
	public void setDoesExtend(String doesExtend) {
		this.doesExtend = (doesExtend != null && doesExtend.equalsIgnoreCase("true"));
	}
	
	public void setDoesImplement(String doesImplement) {
		this.doesImplement = (doesImplement != null && doesImplement.equalsIgnoreCase("true"));
	}
	
	public void setDoesImplement(boolean doesImplement) {
		this.doesImplement = doesImplement;
	}
	
	public boolean isDoesImplement() {
		return doesImplement;
	}
	
	
	public String getMethodWildcard(String methodName) {
		String wildcard = null;
		for (String key : methodNameHash.keySet()) {
			if (key.contains("*") && key.length() > 1) {
				wildcard = key.substring(0, key.length() - 1);
			}
		}
		
		return wildcard;
	}
	
	public String methodMatchesWildcard(String methodName) {
		String keyRet = null;
		for (String key : methodNameHash.keySet()) {
			if (key.contains("*") && key.length() > 1) {
				int length = key.length() -1; //Remove *-wildcard from length
				System.out.println("wildcard has length of: " + length + " :: " + key);
				String wildcard = methodName.substring(0, length) + "*";
				System.out.println("Method Name Wildcard is: " + wildcard);
				if (wildcard.equals(key)) {
					keyRet = key;
					break;
				}
			}
		}
		
		return keyRet;
	}
	
	public MethodInstrumentation getMethod(String methodName) {
		MethodInstrumentation mi = null;
		String wildcardKey = methodMatchesWildcard(methodName);
		
		if (methodNameHash.containsKey(methodName)) {
			//Direct method match
			mi = methodNameHash.get(methodName);
		} else if (wildcardKey != null) {
			//Method matches wildcard
			mi = methodNameHash.get(wildcardKey);
		} else if (methodNameHash.containsKey("{all}")) {
			//All methods are instrumented
			mi = methodNameHash.get("{all}");
		}
		
		return mi;
	}
	
	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
		sb.append(packageName + " " + className + " " + methodNameHash + " " + " " + path);
		return sb.toString();
	}
	
	
}
