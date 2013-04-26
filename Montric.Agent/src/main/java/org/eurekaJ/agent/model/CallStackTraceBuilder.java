package org.eurekaJ.agent.model;

import org.eurekaJ.agent.EurekaJStringLogger;

public class CallStackTraceBuilder {
	private static CallStackTraceBuilderStateThreadLocal traceBuilderState = new CallStackTraceBuilderStateThreadLocal();
	
	public void enter(String methodName, String methodSignature, String fullyQualifiedClassname, String classType, String path, long timestamp) {
		//System.out.println("\t\tCallStackTraceBuilder enter from: " + fullyQualifiedClassname + "." + methodSignature);
		
		CallStackTraceBuilderState state = traceBuilderState.get();
		if (state.isBuildingTrace()) {
			return; //If we are buildning a trace already, do not start a new trace
		}
		
		state.setBuildingTrace(true);
		state.incCount();
		state.incLevel();
		
		if (state.getCount() > 10000) {
			System.out.println("********************");
			System.out.println("enter: Call Stack of over 10000 method calls are truncated");
			System.out.println("********************");
			return;
		}
		
		CallStack currentCall = new CallStack();
		
		CallStack contextCall = state.getCallStack();
		
		if (contextCall == null) {
			//Inital call
			state.setStartTimestamp(timestamp);
			state.setClassType(classType);
			state.setPath(path);
			state.setClassName(fullyQualifiedClassname);
			state.setMethodName(methodName);
		} else {
			contextCall.addMethodCall(currentCall);
		}
		
		currentCall.setMethodName(methodName);
		currentCall.setMethodSignature(methodSignature);
		currentCall.setTimestamp(timestamp);
		currentCall.setFullyQualifiedClassname(fullyQualifiedClassname);
		currentCall.setLevel(state.getLevel());
		
		
		state.setCallStack(currentCall);
		
		state.setBuildingTrace(false);
	}
	
	public void leave(long executionTime) {
		CallStackTraceBuilderState state = traceBuilderState.get();
		if (state.isBuildingTrace()) {
			return; //If we are buildning a trace already, do not start a new trace
		}
		
		state.setBuildingTrace(true);
		state.decLevel();
		
		CallStack contextStack = state.getCallStack();
		if (contextStack != null) {
			contextStack.setExecutionTime(executionTime);
			
			if (contextStack.getCallingMethod() == null) { 
				state.setStopTimestamp(contextStack.getTimestamp() + executionTime);
				//System.out.println("No calling method for: " + contextStack.toString());
				//System.out.println("Printing stack trace");
				EurekaJStringLogger.logCallStack(state);
				traceBuilderState.remove();
			} else {
				if (state.getCount() > 10000) {
					System.out.println("********************");
					System.out.println("leave: Call Stack of over 10000 method calls are truncated");
					System.out.println("********************");
					return;
				}
				
				CallStack callingMethod = contextStack.getCallingMethod();
				state.setCallStack(callingMethod);
			}
		}
		state.setBuildingTrace(false);
	}
}

class CallStackTraceBuilderStateThreadLocal extends ThreadLocal<CallStackTraceBuilderState> {
	
	@Override
	protected CallStackTraceBuilderState initialValue() {
		return new CallStackTraceBuilderState();
	}
}
