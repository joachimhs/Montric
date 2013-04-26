package org.eurekaJ.agent.model;

public class CallStackTraceBuilderFactory {
	private static CallStackTraceBuilder callStackTrace = null;
	
	public static CallStackTraceBuilder getCallStackTraceBuilder() {
		//System.out.println("Getting Call Stack Trace Builder");
		if (callStackTrace == null) {
			//System.out.println("Call Stack Trace Builder  is NULL. Instantiating");
			callStackTrace = new CallStackTraceBuilder();
		}
		//System.out.println("Returning Call Stack Trace Builder");
		return callStackTrace;
	}
}
