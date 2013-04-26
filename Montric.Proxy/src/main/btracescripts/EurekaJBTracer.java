package org.eurekaj.btracers;

import com.sun.btrace.annotations.*;
import com.sun.btrace.aggregation.*;
import static com.sun.btrace.BTraceUtils.*;
import java.util.Deque;

@BTrace public class EurekaJBTracer {
	
	private static Aggregation TOTAL_EXEC_TIME = newAggregation(AggregationFunction.SUM);
	private static Aggregation MIN_TIMESTAMP = newAggregation(AggregationFunction.MINIMUM);
	private static Aggregation CALLS_PER_INTERVAL = newAggregation(AggregationFunction.COUNT);
	@TLS private static Deque<Long> q = newDeque();
	
	@OnMethod(clazz="/org\\.eurekaJ\\.manager\\..*/", method="/.*/", location=@Location(value=Kind.ENTRY))
	public static void enterMethod() {
		push(q, box(timeNanos()));
	}
	
	@OnMethod(clazz="/org\\.eurekaJ\\.manager\\..*/", method="/.*/", location=@Location(value=Kind.RETURN))
	public static void exitMethod(@ProbeMethodName String probeMethod, @ProbeClassName String probeClass) {
		int execTime = (int)(timeNanos() - unbox(poll(q)));
		Long timePeriod = ((long)(timeNanos() / 15000000000l)*15000);
		
		//Yields fullyQualifiedClassName methodName, 15000 millisecond interval since 1970
		AggregationKey k = newAggregationKey(probeClass, probeMethod, timePeriod);

		addToAggregation(TOTAL_EXEC_TIME, k, execTime);
		addToAggregation(MIN_TIMESTAMP, k, timeNanos());
		addToAggregation(CALLS_PER_INTERVAL, k, 1);
	}
	
	@OnTimer(7500)
    public static void printAverage() {
		//TotalExecTime: agentname package.Class method timeperiod exectime classType
		//CallsPerInterval: agentname package.Class method timeperiod callsWithinTimeperiod classType
		
		String execStringFormat = strcat("[TotalExecTime;", property("btrace.agentname"));
		printAggregation("", TOTAL_EXEC_TIME,  strcat(execStringFormat, ";%1$s;%2$s;%3$d;%4$d;Custom]"));
		
		String callsStringFormat = strcat("[CallsPerInterval: ", property("btrace.agentname"));
		printAggregation("", CALLS_PER_INTERVAL,  strcat(callsStringFormat, ";%1$s;%2$s;%3$d;%4$d;Custom]"));
		
		//printAggregation("TOTAL_EXEC_TIME", TOTAL_EXEC_TIME, strcat("TotalExecTime: ",property("btrace.agentname")), "Custom", " ");
		//printAggregation("CALLS_PER_INTERVAL: ", CALLS_PER_INTERVAL, strcat("CallsPerInterval: ", property("btrace.agentname")), "Custom", " ");
		
		truncateAggregation(TOTAL_EXEC_TIME, 0);
		truncateAggregation(MIN_TIMESTAMP, 0);
		truncateAggregation(CALLS_PER_INTERVAL, 0);
    }	
}