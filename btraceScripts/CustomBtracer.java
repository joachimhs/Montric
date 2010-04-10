package org.eurekaj.btracers;

import com.sun.btrace.annotations.*;
import com.sun.btrace.aggregation.*;
import static com.sun.btrace.BTraceUtils.*;
import java.util.Deque;

@BTrace public class CustomBtracer {
	
	private static Aggregation TOTAL_EXEC_TIME_C = newAggregation(AggregationFunction.SUM);
	private static Aggregation CALLS_PER_INTERVAL_C = newAggregation(AggregationFunction.COUNT);
	@TLS private static Deque<Long> componentQ = newDeque();
	
	private static Aggregation TOTAL_EXEC_TIME_D = newAggregation(AggregationFunction.SUM);
	private static Aggregation CALLS_PER_INTERVAL_D = newAggregation(AggregationFunction.COUNT);
	@TLS private static Deque<Long> demoQ = newDeque();
	
	@OnMethod(clazz="/org\\.jsflot\\.components\\..*/", method="/.*/", location=@Location(value=Kind.ENTRY))
	public static void enterComponentMethod() {
		push(componentQ, box(timeNanos()));
	}
	
	@OnMethod(clazz="/org\\.jsflot\\.components\\..*/", method="/.*/", location=@Location(value=Kind.RETURN))
	public static void exitComponentMethod(@ProbeMethodName String probeMethod, @ProbeClassName String probeClass) {
		int execTime = (int)(timeNanos() - unbox(poll(componentQ)));
		Long timePeriod = ((long)(timeNanos() / 15000000000l)*15000);
		
		//Yields fullyQualifiedClassName methodName, 15000 millisecond interval since 1970
		AggregationKey k = newAggregationKey(probeClass, probeMethod, timePeriod);

		addToAggregation(TOTAL_EXEC_TIME_C, k, execTime);
		addToAggregation(CALLS_PER_INTERVAL_C, k, 1);
	}
	
	@OnMethod(clazz="/org\\.jsflot\\.demo\\..*/", method="/.*/", location=@Location(value=Kind.ENTRY))
	public static void enterMethod() {
		push(demoQ, box(timeNanos()));
	}
	
	@OnMethod(clazz="/org\\.jsflot\\.demo\\..*/", method="/.*/", location=@Location(value=Kind.RETURN))
	public static void exitMethod(@ProbeMethodName String probeMethod, @ProbeClassName String probeClass) {
		int execTime = (int)(timeNanos() - unbox(poll(demoQ)));
		Long timePeriod = ((long)(timeNanos() / 15000000000l)*15000);
		
		//Yields fullyQualifiedClassName methodName, 150000 millisecond interval since 1970
		AggregationKey k = newAggregationKey(probeClass, probeMethod, timePeriod);

		addToAggregation(TOTAL_EXEC_TIME_D, k, execTime);
		addToAggregation(CALLS_PER_INTERVAL_D, k, 1);
	}
	
	@OnTimer(7500)
    public static void printAverage() {
		//TotalExecTime: agentname package.Class method timeperiod exectime classType
		//CallsPerInterval: agentname package.Class method timeperiod callsWithinTimeperiod classType
		String execStringFormat = strcat("[TotalExecTime;", property("btrace.agentname"));
		String callsStringFormat = strcat("[CallsPerInterval;", property("btrace.agentname"));
		
		printAggregation("", TOTAL_EXEC_TIME_C,  strcat(execStringFormat, ";%1$s;%2$s;%3$d;%4$d;Custom:Components]"));
		printAggregation("", CALLS_PER_INTERVAL_C,  strcat(callsStringFormat, ";%1$s;%2$s;%3$d;%4$d;Custom:Components]"));
		
		printAggregation("", TOTAL_EXEC_TIME_D,  strcat(execStringFormat, ";%1$s;%2$s;%3$d;%4$d;Custom:Demo]"));
		printAggregation("", CALLS_PER_INTERVAL_D,  strcat(callsStringFormat, ";%1$s;%2$s;%3$d;%4$d;Custom:Demo]"));
		
		truncateAggregation(TOTAL_EXEC_TIME_C, 0);
		truncateAggregation(CALLS_PER_INTERVAL_C, 0);
		
		truncateAggregation(TOTAL_EXEC_TIME_D, 0);
		truncateAggregation(CALLS_PER_INTERVAL_D, 0);
		

    }
}